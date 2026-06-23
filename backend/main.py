import asyncio
import os
import sys
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ── Validate critical env vars ────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    sys.stderr.write("CRITICAL ERROR: Missing environment variable: JWT_SECRET\n")
    sys.exit(1)

MONGO_URI = os.getenv("MONGO_URI", "")
_demo_mode = not MONGO_URI or "YOUR_USER" in MONGO_URI or "YOUR_PASSWORD" in MONGO_URI

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from config.database import close_db, connect_db, create_indexes, is_connected, try_reconnect
from routes.admin import router as admin_router
from routes.auth import router as auth_router
from routes.categories import router as categories_router
from routes.coupons import router as coupons_router
from routes.orders import router as orders_router
from routes.payment import router as payment_router
from routes.products import router as products_router
from routes.public import router as public_router
from routes.vendor_dashboard import router as vendor_dashboard_router
from routes.vendors import router as vendors_router

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


# ── Rate limiter (sliding window, in-memory) ──────────────────────────────────

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Per-IP sliding-window rate limiter for sensitive endpoints."""

    _RULES = [
        ("/api/auth/login",    10, 900),   # 10 per 15 min
        ("/api/auth/register", 10, 900),   # 10 per 15 min
        ("/api/payment/",      20, 3600),  # 20 per hour
        ("/api/payment",       20, 3600),
    ]

    def __init__(self, app):
        super().__init__(app)
        self._windows: dict = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()

        for prefix, max_req, window in self._RULES:
            if path == prefix or path.startswith(prefix):
                key = f"{prefix}|{ip}"
                bucket = self._windows[key]
                while bucket and bucket[0] < now - window:
                    bucket.popleft()
                if len(bucket) >= max_req:
                    return JSONResponse(
                        status_code=429,
                        content={"success": False, "message": "Too many requests. Please try again later."},
                    )
                bucket.append(now)
                break

        return await call_next(request)


# ── Background reconnect ──────────────────────────────────────────────────────

async def _reconnect_loop():
    while True:
        await asyncio.sleep(30)
        if not is_connected() and not _demo_mode and MONGO_URI:
            print("MongoDB offline — attempting reconnect...")
            if await try_reconnect():
                print("MongoDB reconnected")
                await create_indexes()


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not _demo_mode:
        try:
            print("Connecting to MongoDB...")
            await connect_db(MONGO_URI)
            print("MongoDB connected")
            await create_indexes()
        except Exception as exc:
            print(f"MongoDB connection failed: {exc}")
            print("Continuing in demo mode without database...")
    else:
        print("Running in demo mode (no database connection)")

    reconnect_task = asyncio.create_task(_reconnect_loop())
    yield
    reconnect_task.cancel()
    await close_db()


app = FastAPI(
    title="Uhazvumart API",
    description="Agro Store REST API — Python/FastAPI",
    version="1.0.0",
    docs_url="/api-docs",
    redoc_url=None,
    lifespan=lifespan,
)


# ── Exception handlers ────────────────────────────────────────────────────────

@app.exception_handler(HTTPException)
async def http_exc(req: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exc(req: Request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={"success": False, "message": "Validation error", "errors": exc.errors()})


@app.exception_handler(Exception)
async def general_exc(req: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


# ── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
)


# ── API Routers ───────────────────────────────────────────────────────────────

app.include_router(auth_router,             prefix="/api/auth",       tags=["auth"])
app.include_router(products_router,         prefix="/api/products",   tags=["products"])
app.include_router(orders_router,           prefix="/api/orders",     tags=["orders"])
app.include_router(vendors_router,          prefix="/api/vendors",    tags=["vendors"])
app.include_router(categories_router,       prefix="/api/categories", tags=["categories"])
app.include_router(payment_router,          prefix="/api/payment",    tags=["payment"])
app.include_router(admin_router,            prefix="/api/admin",      tags=["admin"])
app.include_router(vendor_dashboard_router, prefix="/api/vendor",     tags=["vendor-dashboard"])
app.include_router(coupons_router,          prefix="/api/coupons",    tags=["coupons"])
app.include_router(public_router,           prefix="/api",            tags=["public"])


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/api/health", include_in_schema=False)
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "message": "Uhazvumart API is running",
        "time": datetime.utcnow().isoformat(),
        "dbState": "connected" if is_connected() else "demo",
    }


# ── Static frontend + SPA fallback ───────────────────────────────────────────

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    if full_path.startswith("api/") or full_path == "api":
        return JSONResponse(status_code=404, content={"success": False, "message": "Route not found"})

    if not FRONTEND_DIR.exists():
        return JSONResponse(status_code=404, content={"message": "Frontend not found"})

    if full_path == "admin":
        admin_html = FRONTEND_DIR / "admin" / "index.html"
        if admin_html.exists():
            return FileResponse(admin_html)

    file_path = FRONTEND_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)

    return FileResponse(FRONTEND_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    print(f"Uhazvumart API -> http://localhost:{port}")
    print(f"Health check   -> http://localhost:{port}/api/health")
    print(f"API docs       -> http://localhost:{port}/api-docs")
    # reload=True spawns subprocesses which lose socket permissions on Windows
    reload = sys.platform != "win32"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)

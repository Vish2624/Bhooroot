import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ── Validate critical env vars ────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    print("❌  CRITICAL ERROR: Missing environment variable: JWT_SECRET")
    sys.exit(1)

MONGO_URI = os.getenv("MONGO_URI", "")
_demo_mode = not MONGO_URI or "YOUR_USER" in MONGO_URI or "YOUR_PASSWORD" in MONGO_URI

if not os.getenv("RAZORPAY_KEY_ID") or (os.getenv("RAZORPAY_KEY_ID") or "").startswith("rzp_test_XXXX"):
    print("⚠️   WARNING: Razorpay keys not configured. Payments will run in demo mode.")

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from config.database import close_db, connect_db, is_connected
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not _demo_mode:
        try:
            print("🔌  Connecting to MongoDB...")
            await connect_db(MONGO_URI)
            print("✅  MongoDB connected")
        except Exception as exc:
            print(f"⚠️   MongoDB connection failed: {exc}")
            print("   Continuing in demo mode without database...")
    else:
        print("⚠️   Running in demo mode (no database connection)")
    yield
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


# ── CORS ──────────────────────────────────────────────────────────────────────

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
        "message": "Uhazvumart API is running",
        "time": datetime.utcnow().isoformat(),
        "dbState": "connected" if is_connected() else "demo",
    }


# ── Static frontend + SPA fallback ───────────────────────────────────────────

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    # Unknown API paths → JSON 404
    if full_path.startswith("api/") or full_path == "api":
        return JSONResponse(status_code=404, content={"success": False, "message": "Route not found"})

    if not FRONTEND_DIR.exists():
        return JSONResponse(status_code=404, content={"message": "Frontend not found"})

    # Specific portal files
    if full_path == "admin":
        admin_html = FRONTEND_DIR / "admin" / "index.html"
        if admin_html.exists():
            return FileResponse(admin_html)
    if full_path in ("vendor", "vendor-portal"):
        vendor_html = FRONTEND_DIR / "vendor" / "index.html"
        if vendor_html.exists():
            return FileResponse(vendor_html)

    # Serve real files (CSS, JS, images, etc.)
    file_path = FRONTEND_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)

    # SPA fallback
    return FileResponse(FRONTEND_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5000"))
    print(f"🚀  Uhazvumart API running  → http://localhost:{port}")
    print(f"📡  Environment: {os.getenv('NODE_ENV', 'production')}")
    print(f"🔗  Health check → http://localhost:{port}/api/health")
    print(f"📖  API docs     → http://localhost:{port}/api-docs")
    print(f"👤  Admin portal → http://localhost:{port}/admin")
    print(f"🏪  Vendor portal → http://localhost:{port}/vendor")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

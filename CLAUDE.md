# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Uhazvumart Agro Store** — a full-stack e-commerce marketplace for agricultural products. Backend is a Python/FastAPI REST API; frontend is a vanilla HTML/CSS/JS SPA served as static files from the backend.

## Commands

All backend commands run from the `backend/` directory.

```bash
cd backend
pip install -r requirements.txt   # Install dependencies
python main.py                     # Start dev server (http://localhost:5000, auto-reload on non-Windows)
uvicorn main:app --port 5000       # Start without reload (required on Windows)
```

There is no frontend build step. The backend serves `frontend/` as static files. Open `http://localhost:5000` after starting the backend.

**Environment setup:**
```bash
cp backend/.env.example backend/.env
# Fill in: MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
```

**Verify the server is running:**
- Health check: `GET http://localhost:5000/api/health`
- API docs (Swagger/OpenAPI): `http://localhost:5000/api-docs`

There is no automated test suite — verification is done manually against the running server.

## Architecture

### Backend (`backend/`)

Entry point is `main.py`. Runtime: Python 3.12 + FastAPI + uvicorn + Motor (async MongoDB driver).

Request flow: route → `RateLimitMiddleware` → `require_auth` / `require_role` dependency → route handler → Motor → JSON response.

**Consistent API response shape:**
```python
{ "success": True|False, "message": "...", "data": ..., "pagination": ... }
```

**Rate limiting** — `RateLimitMiddleware` in `main.py` (sliding window, in-memory, per-IP):
- `/api/auth/login`, `/api/auth/register` — 10 req / 15 min
- `/api/payment/*` — 20 req / hour

**Authentication** lives in `middleware/auth.py`:
- `require_auth` — JWT must be present and valid
- `optional_auth` — JWT decoded if present, else `None`
- `require_role(*roles)` — requires auth + specific role(s)

**Database** — `config/database.py`:
- `connect_db(uri)` + `create_indexes()` called at startup
- `try_reconnect()` retried every 30 s in background if connection drops
- `is_connected()` — check before all DB operations; raise 503 if False

**Routes** (`routes/`): `admin`, `auth`, `categories`, `coupons`, `orders`, `payment`, `products`, `public`, `vendor_dashboard`, `vendors`.

**Helpers** (`utils/helpers.py`): `serialize_doc`, `serialize_list`, `to_oid`, `get_pagination_metadata`.

### Frontend (`frontend/`)

Single-page application using show/hide div routing — no framework, no build step.

**Key modules in `js/`:**
- `router.js` — controls which page div is visible; handles browser history
- `api.js` — centralized fetch wrapper; manages JWT from `localStorage` and sets `Authorization` headers
- `cart.js` — in-memory cart state + UI rendering
- `payment.js` — Razorpay checkout integration
- `data.js` — fallback sample data used when the API is unreachable
- `slider.js` — homepage hero slider; reads banners from `GET /api/banners?type=hero`

**Admin portal** is at `frontend/admin/index.html` — a separate page with its own auth flow (shares JWT via localStorage SSO with the main site).

**CSS** is modular with design tokens in `css/variables.css`. All colors, spacing, and typography must use those CSS variables — never hardcode values.

**Icons** use the Iconify web component loaded from CDN. Do not add custom SVGs or emoji for icons.

`docs/` contains a deployment copy of the frontend for GitHub Pages — update it when shipping frontend changes intended for production.

## Conventions

- **New backend routes**: add `require_auth` / `require_role` dependency, raise 503 if `not is_connected()`, return the standard `{"success": ..., "data": ...}` shape.
- **Frontend JS**: use the existing functional module pattern (`Api.get(...)`, `Cart.add(...)`, etc.) rather than introducing classes or a framework.
- **After significant backend changes**: update `backend/BACKEND_CHANGES_SUMMARY.md`.
- **CSS**: always use variables from `css/variables.css`; never hardcode colors, spacing, or fonts.

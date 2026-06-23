# Backend Changes Summary

## 2026-06-23 — Security, Bug Fixes & Performance Improvements

### Security Fixes

**`routes/products.py`**
- `PUT /{product_id}` and `DELETE /{product_id}` now require authentication via `require_auth`.
- Authorization check added: only the owning vendor or an admin can modify/delete a product. Returns 403 otherwise.
- Protected fields (`_id`, `vendor`, `createdAt`, `approvalStatus`) are stripped from PUT payload — callers cannot overwrite them.

**`routes/auth.py`**
- Demo mode login now rejects unknown credentials (previously any email/password logged in as a customer when DB was offline). Only the three predefined demo accounts work in demo mode.
- `_create_token()` uses `os.environ["JWT_SECRET"]` directly — no silent fallback to a weak dev secret.
- Minimum password length raised from 6 to 8 characters (register and change-password).

### Bug Fixes

**`routes/vendor_dashboard.py`**
- `vendor_stats()` was counting ALL orders/revenue system-wide. Now scoped to the current vendor's products via `items.product.$in` filter.
- `list_vendor_orders()` was returning ALL orders. Now filtered to orders containing at least one of the vendor's products.
- `update_vendor_order()` had no ownership check — any vendor could update any order. Now verifies the order contains the vendor's products before allowing the update.
- `asyncio` moved to top-level import (was imported inside a function body).

**`routes/products.py`**
- `$text` search now falls back to regex (`$or` on name/description/brand) if MongoDB text index doesn't exist yet, instead of throwing a 500 error.

### New Features

**`routes/products.py`**
- `POST /api/products/:id/reviews` — authenticated users can submit a star rating + comment. Prevents duplicate reviews from the same user. Recomputes average rating on submit.

**`routes/auth.py`**
- `PATCH /api/auth/profile` — authenticated users can update their name, phone, and address.

### Infrastructure

**`config/database.py`**
- Added `try_reconnect()` — safely replaces the Motor client if the connection drops, without restarting the server.
- Added `create_indexes()` — creates all required MongoDB indexes on startup (text index for product search, compound indexes for common filter patterns, unique indexes on email/orderNumber/slug/code). Safe to call multiple times (idempotent).

**`main.py`**
- `RateLimitMiddleware` added (sliding-window, in-memory, per-IP):
  - `POST /api/auth/login` — 10 requests per 15 minutes
  - `POST /api/auth/register` — 10 requests per 15 minutes
  - `POST /api/payment/*` — 20 requests per hour
- `create_indexes()` called on startup after successful DB connection.
- Background `_reconnect_loop()` task retries MongoDB every 30 seconds when disconnected.
- Removed stale vendor-portal route handler (vendor pages were deleted in a prior session).

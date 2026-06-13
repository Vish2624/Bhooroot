# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Uhazvumart Agro Store** — a full-stack e-commerce marketplace for agricultural products. Backend is a Node.js/Express REST API; frontend is a vanilla HTML/CSS/JS SPA served as static files from the backend.

## Commands

All backend commands run from the `backend/` directory.

```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with nodemon (http://localhost:5000)
npm start            # Start production server
node seed.js         # Seed the database with sample data
```

There is no frontend build step. The backend serves `frontend/` as static files. Open `http://localhost:5000` after starting the backend.

**Environment setup:**
```bash
cp backend/.env.example backend/.env
# Fill in: MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
```

**Verify the server is running:**
- Health check: `GET http://localhost:5000/api/health`
- API docs (Swagger UI): `http://localhost:5000/api-docs`

There is no automated test suite — verification is done manually against the running server.

## Architecture

### Backend (`backend/`)

Entry point is `server.js`. Request flow: route → rate limiter middleware → express-validator → controller logic → Mongoose → JSON response.

**Consistent API response shape:**
```js
{ success: true|false, message: "...", data?: any, pagination?: any }
```

**Rate limiting tiers** (applied per-router in `middleware/`):
- `generalLimiter` — 10 req/min (all standard endpoints)
- `authLimiter` — 5 req/15min (login/register)
- `paymentLimiter` — 20 req/hour (checkout)

**Input validation** lives in `utils/validators.js` using `express-validator`. Every mutating route must use these validation chains and check `validationResult` before processing.

**Swagger docs** are defined in `config/swagger.js`. Every new model or route must be documented there using OpenAPI 3.0 schemas.

**Models** (`models/`): `User`, `Product`, `Order`, `Vendor` — all Mongoose schemas.

**Routes** (`routes/`): `auth`, `products`, `vendors`, `orders`, `payment`.

### Frontend (`frontend/`)

Single-page application using show/hide div routing — no framework, no build step.

**Key modules in `js/`:**
- `router.js` — controls which page div is visible; handles browser history
- `api.js` — centralized fetch wrapper; manages JWT from `localStorage` and sets `Authorization` headers
- `cart.js` — in-memory cart state + UI rendering
- `payment.js` — Razorpay checkout integration
- `data.js` — fallback sample data used when the API is unreachable

**CSS** is modular with design tokens in `css/variables.css`. All colors, spacing, and typography must use those CSS variables — never hardcode values.

**Icons** use the Iconify web component loaded from CDN. Do not add custom SVGs or emoji for icons.

`docs/` contains a deployment copy of the frontend for GitHub Pages — update it when shipping frontend changes intended for production.

## Conventions

- New backend routes: apply the appropriate rate limiter, add express-validator rules from `utils/validators.js`, document in `config/swagger.js`.
- Frontend JS: use the existing functional module pattern (`Api.get(...)`, `Cart.add(...)`, etc.) rather than introducing classes or a framework.
- After significant backend changes, update `backend/BACKEND_CHANGES_SUMMARY.md`.

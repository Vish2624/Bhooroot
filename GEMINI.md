# GEMINI.md — Project Instructions

## Project Overview
**Uhazvumart Agro Store** is a full-stack e-commerce marketplace for agricultural products (seeds, fertilizers, machinery, etc.). It features a pure HTML/CSS/JS frontend and a Node.js/Express backend with a RESTful API.

### Core Technologies
- **Backend:** Node.js, Express, MongoDB (Mongoose), Swagger (OpenAPI 3.0), Razorpay (Payments).
- **Frontend:** Vanilla JavaScript, CSS3, HTML5, Iconify (Icons), Google Fonts.
- **Security:** JWT Authentication, Rate Limiting, Input Validation (express-validator), Helmet (Security Headers).
- **Monitoring:** Request ID tracking (x-request-id).

### Architecture
- **Monorepo Structure:**
    - `backend/`: API logic, models, routes, and middleware.
    - `frontend/`: Static storefront assets.
    - `docs/`: Deployment-ready frontend build (likely for GitHub Pages).
- **Static Serving:** The backend is configured to serve the `frontend/` directory as static files.
- **API Documentation:** Interactive Swagger UI is available at `/api-docs`.

---

## Building and Running

### Prerequisites
- Node.js (>= 18.0.0)
- MongoDB (Local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your MONGO_URI and RAZORPAY_KEY_ID
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:5000`.

### Frontend Setup
- **Via Backend (Recommended):** Once the backend is running, access the app at `http://localhost:5000`.
- **Standalone:** Open `frontend/index.html` directly in a browser (Note: API calls may fail if the backend isn't running or CORS isn't configured for `file://`).

### Testing
- **Health Check:** `GET http://localhost:5000/api/health`
- **API Docs:** `GET http://localhost:5000/api-docs`

---

## Development Conventions

### Coding Style
- **JavaScript:** Use modern ES6+ syntax. In the frontend, prefer functional modules (e.g., `Api`, `Router`, `Cart` objects).
- **CSS:** Use variables defined in `css/variables.css` for consistent colors, spacing, and typography.
- **Backend Errors:** All API errors should follow a consistent format: `{ success: false, message: "..." }`.

### API Routes
- Use the `generalLimiter` for standard GET requests.
- Use `authLimiter` for login/register endpoints.
- Use `paymentLimiter` for checkout processes.
- Always include `x-request-id` in logs when debugging.

### Database
- Models are located in `backend/models/`.
- Ensure new models are properly documented in `backend/config/swagger.js`.

### Contribution Workflow
1. For backend changes, summarize updates in `BACKEND_CHANGES_SUMMARY.md`.
2. Follow the completion checklist in `SETUP_COMPLETE.md` when introducing new core features.
3. Ensure input validation is added to all new routes using `backend/utils/validators.js`.

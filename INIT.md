# Project Initialization Report — Uhazvumart Agro Store

This document records the initialization steps, system state, and custom enhancements made to successfully run the **Uhazvumart Agro Store** application.

---

## ⚙️ Initialization Workflow

The following steps were executed to set up and verify the codebase:

### 1. Workspace Analysis
* Detected a full-stack structure with a Node.js/Express `backend/` and a static vanilla JS/CSS/HTML `frontend/`.
* Verified that backend dependencies were installed inside `backend/node_modules`.

### 2. Mongoose Timeout Tuning (Enhancement)
To prevent the Express server from hanging indefinitely during database connection attempts under strict network or IP-filtering environments (such as when accessing MongoDB Atlas cluster without whitelisting), we updated the MongoDB connection block in [server.js](file:///Z:/Uhazvumart/Uhazvumart/backend/server.js):
* **Added a Connection Timeout**: Set `serverSelectionTimeoutMS: 5000` inside `mongoose.connect()`.
* **Added Connection Logging**: Logs `🔌 Connecting to MongoDB...` at startup so server initialization progress is clear.
* **Fail-Fast Behaviour**: If Atlas is unreachable, the backend catches the error within **5 seconds** and boots the server immediately in **Demo/Fallback mode** (utilizing local datasets inside `frontend/js/data.js`).

### 3. Server Startup
* Started the dev server in the background:
  ```bash
  cd backend
  node server.js
  ```
* The server caught the MongoDB connection timeout (IP whitelist check) and fell back gracefully:
  ```text
  🔌  Connecting to MongoDB...
  ⚠️   MongoDB connection failed: Could not connect to any servers in your MongoDB Atlas cluster...
     Continuing in demo mode without database...
  🚀  Uhazvumart API running  → http://localhost:5000
  📡  Environment: development
  🔗  Health check → http://localhost:5000/api/health
  ```

### 4. Verification Check
* **Health Check**: Run `Invoke-RestMethod -Uri "http://localhost:5000/api/health"` in PowerShell or access in browser. Returned `status: "ok"`.
* **Frontend Static Assets**: Verified that `http://localhost:5000/` successfully serves the frontend single-page application.

---

## 📡 Access Endpoints

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Storefront Web App** | [http://localhost:5000](http://localhost:5000) | Main e-commerce storefront |
| **API Documentation** | [http://localhost:5000/api-docs](http://localhost:5000/api-docs) | Swagger UI for REST endpoints |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | JSON API health status |

---

## 🛠️ Environment Configuration (`backend/.env`)

The server uses the following configurations:
* **PORT**: `5000`
* **NODE_ENV**: `development`
* **CLIENT_URL**: `http://localhost:3000` (Frontend origin permitted by CORS)
* **MONGO_URI**: Pre-configured Atlas cluster URI.
* **JWT_SECRET**: Pre-configured token signature secret.

---

## 🚀 Running the App Locally

To start the server at any time, execute:
```bash
cd backend
npm run dev
```

*For production (non-watch mode):*
```bash
cd backend
npm start
```

// ── API Configuration ─────────────────────────────────────────────────────────
// Change BACKEND_URL to match wherever the Python backend is deployed.
// This file is loaded before api.js in every HTML page.

const BACKEND_URL = (() => {
  // GitHub Pages — update this with your deployed backend URL (Render / Railway / etc.)
  if (location.hostname.includes('github.io')) return 'https://uhazvumart-api.onrender.com';
  // Local development
  return 'http://localhost:5000';
})();

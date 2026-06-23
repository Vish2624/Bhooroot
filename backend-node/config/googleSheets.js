// Google Sheets integration — posts auth events via Apps Script webhook
//
// Setup (one-time, takes ~3 minutes):
//   1. Go to sheets.new → create a sheet → rename Tab 1 to "Auth Log"
//   2. Click Extensions → Apps Script → paste the script from docs/google-apps-script.js
//   3. Click Deploy → New Deployment → Web App
//      - Execute as: Me  |  Who has access: Anyone
//   4. Copy the Web App URL and set it in backend/.env:
//        GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec
//
// No service account, no private keys needed.

const WEBHOOK_URL = () => process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

const postToSheet = async (row) => {
  const url = WEBHOOK_URL();
  if (!url) return; // silently skip if not configured

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row }),
    });
  } catch (err) {
    console.warn('⚠️   Google Sheets webhook failed:', err.message);
  }
};

// Called on every login attempt
const logLogin = async (email, role, status, ip = '') => {
  await postToSheet([
    new Date().toISOString(),
    'Login',
    '',        // Name (not available at login)
    email,
    '',        // Phone (not available at login)
    role,
    status,
    ip,
  ]);
};

// Called on every new registration
const logRegistration = async (name, email, phone, role, ip = '') => {
  await postToSheet([
    new Date().toISOString(),
    'Register',
    name,
    email,
    phone,
    role,
    'success',
    ip,
  ]);
};

// Called on every new order
const logOrder = async (orderId, customerEmail, total, itemsCount, ip = '') => {
  await postToSheet([
    new Date().toISOString(),
    'Order',
    '',        // Name
    customerEmail,
    '',        // Phone
    'order_id: ' + orderId,
    'total: ₹' + total + ' (' + itemsCount + ' items)',
    ip,
  ]);
};

// initSheets is now a no-op (no SDK to initialize)
const initSheets = async () => {
  const url = WEBHOOK_URL();
  if (url) console.log('✅  Google Sheets webhook configured');
  else console.log('ℹ️   Google Sheets not configured (set GOOGLE_SHEETS_WEBHOOK_URL to enable)');
};

module.exports = { initSheets, logLogin, logRegistration, logOrder };

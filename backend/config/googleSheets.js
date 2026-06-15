// Google Sheets integration — logs logins and user registrations
// Set these env vars to enable:
//   GOOGLE_SHEETS_ID       — the spreadsheet ID from the URL
//   GOOGLE_CLIENT_EMAIL    — service account email
//   GOOGLE_PRIVATE_KEY     — service account private key (with \n escaped)

let sheetsClient = null;

const initSheets = async () => {
  const { GOOGLE_SHEETS_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;
  if (!GOOGLE_SHEETS_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) return null;

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    sheetsClient = sheets;
    console.log('✅  Google Sheets connected');
    return sheets;
  } catch (err) {
    console.warn('⚠️   Google Sheets init failed:', err.message);
    return null;
  }
};

const appendToSheet = async (sheetName, values) => {
  if (!sheetsClient) return;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  try {
    await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
  } catch (err) {
    console.warn(`⚠️   Sheets append failed (${sheetName}):`, err.message);
  }
};

// Log login event: timestamp, email, role, status, IP
const logLogin = async (email, role, status, ip = '') => {
  await appendToSheet('Login Log', [
    new Date().toISOString(),
    email,
    role,
    status,
    ip,
  ]);
};

// Log new user registration
const logRegistration = async (name, email, phone, role) => {
  await appendToSheet('Users', [
    new Date().toISOString(),
    name,
    email,
    phone,
    role,
    'registered',
  ]);
};

module.exports = { initSheets, logLogin, logRegistration };

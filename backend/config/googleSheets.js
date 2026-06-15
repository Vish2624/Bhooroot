// Google Sheets integration — logs all auth events (login + register)
// to a SINGLE sheet tab named "Auth Log".
//
// Sheet column layout (row 1 = headers, auto-created on first run):
//   A: Timestamp  B: Type  C: Name  D: Email  E: Phone  F: Role  G: Status  H: IP
//
// Required env vars in backend/.env:
//   GOOGLE_SHEETS_ID       — spreadsheet ID from the URL (between /d/ and /edit)
//   GOOGLE_CLIENT_EMAIL    — service account email
//   GOOGLE_PRIVATE_KEY     — service account private key (\n escaped as \\n)

const SHEET_TAB = 'Auth Log';

let sheetsClient = null;
let headersWritten = false;

const HEADERS = ['Timestamp', 'Type', 'Name', 'Email', 'Phone', 'Role', 'Status', 'IP'];

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
    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅  Google Sheets connected →', GOOGLE_SHEETS_ID);
    await ensureHeaders();
    return sheetsClient;
  } catch (err) {
    console.warn('⚠️   Google Sheets init failed:', err.message);
    return null;
  }
};

// Write header row if the sheet is empty
const ensureHeaders = async () => {
  if (headersWritten || !sheetsClient) return;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  try {
    const res = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_TAB}!A1`,
    });
    if (!res.data.values || res.data.values.length === 0) {
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_TAB}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [HEADERS] },
      });
    }
    headersWritten = true;
  } catch (err) {
    // Tab may not exist yet — silently continue; first append will create the data
    headersWritten = true;
  }
};

// Append one row to the single Auth Log sheet
const appendRow = async (values) => {
  if (!sheetsClient) return;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  try {
    await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_TAB}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] },
    });
  } catch (err) {
    console.warn('⚠️   Sheets append failed:', err.message);
  }
};

// Called on every login attempt
// Type = "Login" | columns: Timestamp, Type, Name(blank), Email, Phone(blank), Role, Status, IP
const logLogin = async (email, role, status, ip = '') => {
  await appendRow([
    new Date().toISOString(),
    'Login',
    '',
    email,
    '',
    role,
    status,
    ip,
  ]);
};

// Called on every new registration
// Type = "Register" | columns: Timestamp, Type, Name, Email, Phone, Role, Status, IP
const logRegistration = async (name, email, phone, role, ip = '') => {
  await appendRow([
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

module.exports = { initSheets, logLogin, logRegistration };

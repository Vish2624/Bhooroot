/**
 * Uhazvumart — Google Apps Script Webhook
 * =========================================
 * Paste this entire file into your Google Apps Script editor.
 *
 * HOW TO SET UP (takes ~3 minutes):
 * ──────────────────────────────────
 * 1. Open your Google Sheet (or create one at sheets.new)
 * 2. Rename "Sheet1" tab to → Auth Log
 * 3. Click Extensions → Apps Script
 * 4. Delete all existing code and paste THIS file
 * 5. Save (Ctrl+S)
 * 6. Click Deploy → New Deployment
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Click Deploy → Authorize when prompted → Copy the Web App URL
 * 8. Paste the URL into backend/.env:
 *    GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec
 * 9. Restart the backend server
 *
 * Sheet columns (auto-created on first request):
 *   Timestamp | Type | Name | Email | Phone | Role | Status | IP
 */

const SHEET_NAME = 'Auth Log';
const HEADERS    = ['Timestamp', 'Type', 'Name', 'Email', 'Phone', 'Role', 'Status', 'IP'];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const row = payload.row;

    if (!Array.isArray(row)) {
      return jsonResponse({ success: false, error: 'row must be an array' });
    }

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Write headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1b4332').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(row);
    return jsonResponse({ success: true });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// Allow GET requests to verify the webhook is live
function doGet() {
  return jsonResponse({ success: true, message: 'Uhazvumart Sheets webhook is live' });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

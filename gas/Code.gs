const DB_NAME  = 'Uhazvumart_Users_DB';
const DATA_START = 3;

// ── Sheet access (auto-creates on first run) ─────────────────────────────────
function getDB() {
  const files = DriveApp.getFilesByName(DB_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create(DB_NAME);
  _setupDB(ss);
  return ss;
}

function _setupDB(ss) {
  const u = ss.getActiveSheet();
  u.setName('Users');
  u.getRange(1,1).setValue('Uhazvumart Users Database');
  u.getRange(2,1,1,9).setValues([['ID','Name','Email','Phone','Password','Role','Created','Status','Notes']]);

  const l = ss.insertSheet('Login_Logs');
  l.getRange(1,1).setValue('Uhazvumart Login Logs');
  l.getRange(2,1,1,7).setValues([['ID','UserID','Email','Timestamp','Source','Status','Device']]);
}

function now() {
  const d = new Date(), p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ── Router ───────────────────────────────────────────────────────────────────
function doGet(e) {
  const p = e.parameter || {};
  try {
    if (p.action === 'register') return handleRegister(p);
    if (p.action === 'login')    return handleLogin(p);
    return respond({ success: true, message: 'Uhazvumart Auth API is running' });
  } catch(err) {
    return respond({ success: false, message: err.message });
  }
}

// ── Register ─────────────────────────────────────────────────────────────────
function handleRegister(p) {
  if (!p.name || !p.email || !p.password)
    return respond({ success: false, message: 'Name, email and password are required.' });

  const ws   = getDB().getSheetByName('Users');
  const last = ws.getLastRow();
  const rows = last >= DATA_START ? ws.getRange(DATA_START,1,last-DATA_START+1,9).getValues() : [];

  if (rows.some(r => String(r[2]).toLowerCase() === p.email.toLowerCase()))
    return respond({ success: false, message: 'Email already registered.' });

  let max = 0;
  rows.forEach(r => {
    if (r[0] && String(r[0]).startsWith('USR')) {
      const n = parseInt(String(r[0]).replace('USR',''), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  const id = 'USR' + String(max + 1).padStart(3, '0');
  ws.appendRow([id, p.name, p.email, p.phone||'', p.password, 'user', now(), 'Active', '']);

  return respond({
    success: true,
    message: 'Registration successful! Welcome to Uhazvumart.',
    user: { id, name: p.name, email: p.email, phone: p.phone||'', role: 'user' }
  });
}

// ── Login ────────────────────────────────────────────────────────────────────
function handleLogin(p) {
  if (!p.email || !p.password)
    return respond({ success: false, message: 'Email and password are required.' });

  const ss      = getDB();
  const usersWs = ss.getSheetByName('Users');
  const logsWs  = ss.getSheetByName('Login_Logs');
  const uLast   = usersWs.getLastRow();
  const users   = uLast >= DATA_START ? usersWs.getRange(DATA_START,1,uLast-DATA_START+1,9).getValues() : [];
  const lLast   = logsWs.getLastRow();
  const logs    = lLast >= DATA_START ? logsWs.getRange(DATA_START,1,lLast-DATA_START+1,7).getValues() : [];

  const user = users.find(r =>
    String(r[2]).toLowerCase() === p.email.toLowerCase() && r[4] === p.password
  );

  let maxL = 0;
  logs.forEach(r => {
    if (r[0] && String(r[0]).startsWith('LOG')) {
      const n = parseInt(String(r[0]).replace('LOG',''), 10);
      if (!isNaN(n) && n > maxL) maxL = n;
    }
  });
  const logId = 'LOG' + String(maxL + 1).padStart(3, '0');

  if (user) {
    logsWs.appendRow([logId, user[0], user[2], now(), 'Web', 'Success', 'Browser']);
    return respond({
      success: true,
      message: 'Login successful!',
      user: { id: user[0], name: user[1], email: user[2], phone: user[3], role: user[5] }
    });
  } else {
    logsWs.appendRow([logId, '', p.email, now(), 'Web', 'Failed', 'Browser']);
    return respond({ success: false, message: 'Invalid email or password.' });
  }
}

// ── Response helper ──────────────────────────────────────────────────────────
function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

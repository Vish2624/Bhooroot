const { exec } = require('child_process');

const url = 'http://localhost:5000';
const platform = process.platform;

let cmd = '';
if (platform === 'win32') {
  cmd = `start ${url}`;
} else if (platform === 'darwin') {
  cmd = `open ${url}`;
} else {
  cmd = `xdg-open ${url}`;
}

console.log(`🔗 Opening ${url} in your default browser...`);
exec(cmd, (err) => {
  if (err) {
    console.error('Failed to open browser:', err);
  }
});

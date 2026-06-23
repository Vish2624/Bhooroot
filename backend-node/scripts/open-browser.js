const { exec } = require('child_process');

const urls = [
  'http://localhost:5000',
  'http://localhost:5000/vendor',
  'http://localhost:5000/admin'
];
const platform = process.platform;

urls.forEach((url) => {
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
      console.error(`Failed to open browser for ${url}:`, err);
    }
  });
});


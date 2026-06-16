const fs = require('fs');
const path = require('path');

const newFonts = `<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />`;

const dirs = [
  'frontend', 'frontend/admin', 'frontend/vendor',
  'docs', 'docs/admin', 'docs/vendor'
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d).filter(f => f.endsWith('.html')).forEach(f => {
    const fp = path.join(d, f);
    let c = fs.readFileSync(fp, 'utf8');
    
    // Regex to match existing font imports
    const regex = /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"\s*\/>\s*(<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin \/>\s*)?<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet"\s*\/>/g;
    
    if (regex.test(c)) {
      c = c.replace(regex, newFonts);
      fs.writeFileSync(fp, c);
      console.log('✅ Updated fonts in ' + fp);
    } else {
      console.log('⚠️ Could not match fonts in ' + fp);
    }
  });
});

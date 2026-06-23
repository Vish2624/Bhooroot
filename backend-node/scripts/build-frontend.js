const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const frontendDir = path.join(rootDir, 'frontend');
const distDir = path.join(frontendDir, 'dist');

// Directories to create
const dirs = [
  distDir,
  path.join(distDir, 'css'),
  path.join(distDir, 'js'),
  path.join(distDir, 'images'),
];

console.log('🏗️  Starting frontend optimization build...');

// 1. Create/Clear directories
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log('🧹 Cleaned existing dist directory');
}

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`✅ Created directory: ${path.relative(rootDir, dir)}`);
});

// Helper to run commands from the backend folder (where node_modules is)
const run = (cmd) => {
  try {
    execSync(cmd, { cwd: path.join(rootDir, 'backend'), stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Error running command: ${cmd}`);
    process.exit(1);
  }
};

// 2. Minify CSS
console.log('\n🎨 Minifying CSS...');
// Storefront Bundle
const storefrontCss = [
  'variables.css', 'layout.css', 'navbar.css', 'hero.css', 'components.css',
  'pages.css', 'cart.css', 'payment.css', 'responsive.css'
].map(f => path.join('..', 'frontend', 'css', f)).join(' ');

run(`npx cleancss -o ${path.join('..', 'frontend', 'dist', 'css', 'style.min.css')} ${storefrontCss}`);

// Portal CSS
run(`npx cleancss -o ${path.join('..', 'frontend', 'dist', 'css', 'portal.min.css')} ${path.join('..', 'frontend', 'css', 'portal.css')}`);

// 3. Minify JS
console.log('\n⚡ Minifying JS...');
// Storefront Bundle
const storefrontJs = [
  'api.js', 'data.js', 'router.js', 'slider.js', 'search.js',
  'products.js', 'vendors.js', 'cart.js', 'payment.js', 'lang.js', 'app.js'
].map(f => path.join('..', 'frontend', 'js', f)).join(' ');

run(`npx uglifyjs ${storefrontJs} -o ${path.join('..', 'frontend', 'dist', 'js', 'app.min.js')} -c -m`);

// 4. Compress Images (especially the bulky logo)
console.log('\n🖼️  Compressing images...');
// Use imagemin to compress the images
run(`npx imagemin ${path.join('..', 'frontend', 'images', '*')} --out-dir=${path.join('..', 'frontend', 'dist', 'images')} --plugin=pngquant`);

console.log('\n✨ Build complete! Assets optimized in frontend/dist/');

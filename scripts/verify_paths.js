const BASE_URL = 'http://localhost:5000/api';

async function verifyPaths() {
  const endpoints = [
    { name: 'Health Check', path: '/health', method: 'GET' },
    { name: 'Get Products', path: '/products', method: 'GET' },
    { name: 'Get Vendors', path: '/vendors', method: 'GET' },
    { name: 'API Docs', path: 'http://localhost:5000/api-docs', method: 'GET', full: true },
  ];

  console.log('--- Backend API Verification ---');
  for (const ep of endpoints) {
    try {
      const url = ep.full ? ep.path : `${BASE_URL}${ep.path}`;
      const res = await fetch(url, { method: ep.method });
      console.log(`[${res.status}] ${ep.name}: ${res.statusText}`);
    } catch (err) {
      console.log(`[ERROR] ${ep.name}: ${err.message}`);
    }
  }

  // Check specific product (assuming ID 1 exists in demo/real data)
  try {
    const res = await fetch(`${BASE_URL}/products/1`);
    console.log(`[${res.status}] Get Single Product (ID:1): ${res.statusText}`);
  } catch (err) {
    console.log(`[ERROR] Get Single Product: ${err.message}`);
  }
}

verifyPaths();

// One-shot script: creates/resets demo accounts for testing portals
// Run: node scripts/create-demo-users.js

const dns      = require('dns');
const path     = require('path');
const dotenv   = require('dotenv');
const mongoose = require('mongoose');
const User     = require('../models/User');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEMO_USERS = [
  { name: 'Super Admin',  email: 'admin@uhazvumart.com',  phone: '9000000001', password_hash: 'admin123',  role: 'admin' },
  { name: 'Demo Vendor',  email: 'vendor@uhazvumart.com', phone: '9000000002', password_hash: 'vendor123', role: 'vendor' },
  { name: 'Demo Customer',email: 'demo@uhazvumart.com',   phone: '9000000003', password_hash: 'demo123',   role: 'customer' },
];

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('❌  MONGO_URI not set in .env'); process.exit(1); }

  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('✅  Connected\n');

  for (const u of DEMO_USERS) {
    await User.deleteOne({ email: u.email });
    await User.create(u);
    console.log(`✅  ${u.role.padEnd(8)} ${u.email}  /  password: ${u.password_hash}`);
  }

  console.log('\n🎉  Demo accounts ready. Login at http://localhost:5000/admin.html or /vendor.html');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });

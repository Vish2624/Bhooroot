// config/db.js — MongoDB connection helper

const mongoose = require('mongoose');

/**
 * Connects to MongoDB with optimized settings for Atlas/production
 * @param {string} uri - MongoDB connection string
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌  MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

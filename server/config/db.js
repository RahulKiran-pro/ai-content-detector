const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truthlens';
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[MongoDB Connected] URI: ${uri}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB Notice] Database connection unavailable (${err.message}). Operating with fallback in-memory store for guest & demo sessions.`);
  }
}

function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  getIsConnected
};

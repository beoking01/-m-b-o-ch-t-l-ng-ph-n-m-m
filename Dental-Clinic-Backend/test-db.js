require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing connection to:', process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('Connected successfully');
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
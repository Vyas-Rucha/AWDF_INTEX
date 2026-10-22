const mongoose = require('mongoose');

/**
 * MongoDB connection helper (Task 5)
 * Reads MONGO_URI from environment variables.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, DB -> ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Do not crash the entire app if DB is offline during testing; log warning
    return null;
  }
};

module.exports = connectDB;

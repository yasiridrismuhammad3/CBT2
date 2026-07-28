const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/damale_cbt';

  try {
    const masked = connStr.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔌 Connecting to MongoDB: ${masked}`);

    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed!`);
    console.error(`   Reason: ${error.message}`);
    console.error(`\n   👉 TO FIX: Go to https://cloud.mongodb.com`);
    console.error(`      → Network Access → Add IP → Allow From Anywhere (0.0.0.0/0)`);
    console.error(`      Then restart: node start-all.js\n`);
    // Do NOT exit — server still starts so frontend loads
    return false;
  }
};

module.exports = connectDB;
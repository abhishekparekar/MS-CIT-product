const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mscit_education_saas';
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`
    ---------------------------------------------------------------------------------
    ℹ️ MongoDB Atlas Setup Guide:
    1. Open backend/.env
    2. Set MONGODB_URI to your MongoDB Atlas connection string:
       MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mscit_saas?retryWrites=true&w=majority
    ---------------------------------------------------------------------------------
    `);
    throw error;
  }
};

module.exports = connectDB;

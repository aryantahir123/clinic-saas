require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const testConnection = async () => {
  console.log('Testing MongoDB connection with URI:', process.env.MONGO_URI);
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connection Successful: ${conn.connection.host}`);
    
    // Check users
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const User = require('./server/models/User');
    const userCount = await User.countDocuments();
    console.log(`Total users in DB: ${userCount}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error(`Details: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
};

testConnection();

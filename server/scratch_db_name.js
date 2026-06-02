require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const checkDbName = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Connected to DB Name: ${conn.connection.name}`);
    
    // Check users
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`Total users in DB: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkDbName();

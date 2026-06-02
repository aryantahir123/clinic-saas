const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes('your_connection_string')) {
      console.log('Placeholder connection string detected. Defaulting to local MongoDB...');
      mongoUri = 'mongodb://127.0.0.1:27017/clinic-saas';
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Warning: ${error.message}`);
    console.log('Server continuing to run without active database connection...');
  }
};

module.exports = connectDB;

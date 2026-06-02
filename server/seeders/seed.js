require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const demoUsers = [
  {
    name: "Admin User",
    email: "admin@clinic.com",
    password: "Admin@1234",
    role: "admin",
  },
  {
    name: "Dr. Ahmed Ali",
    email: "doctor@clinic.com",
    password: "Doctor@1234",
    role: "doctor",
    specialization: "General Medicine",
  },
  {
    name: "Sara Khan",
    email: "reception@clinic.com",
    password: "Recept@1234",
    role: "receptionist",
  },
  {
    name: "Ali Hassan",
    email: "patient@clinic.com",
    password: "Patient@1234",
    role: "patient",
  },
];

const seedDatabase = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Gracefully handle placeholder URIs for local setup/testing
    if (!mongoUri || mongoUri.includes('your_connection_string')) {
      console.log('Placeholder connection string detected. Defaulting to local MongoDB...');
      mongoUri = 'mongodb://127.0.0.1:27017/clinic-saas';
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 // fail fast if db is offline
    });
    console.log('Database connected for seeding successfully.');

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        // Will trigger User's pre-save hook to securely hash passwords
        await User.create(u);
        console.log(`✅ Seeded account: ${u.name} (${u.role})`);
      } else {
        console.log(`ℹ️ Account already exists: ${u.name} (${u.role})`);
      }
    }

    console.log('Seeding process successfully completed.');
  } catch (error) {
    console.error('⚠️ Seeding interrupted: Could not connect to database or perform operation.');
    console.error(`Details: ${error.message}`);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Database connection closed.');
    } catch (err) {
      // already disconnected
    }
  }
};

seedDatabase();

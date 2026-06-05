const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Database Connection
const connectDB = require('./config/db');
connectDB();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Dynamically allow any origin to prevent CORS errors in Vercel preview/production deployments
    callback(null, true);
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Mount Core Application Routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Seed endpoint for cloud deployment initialization
const User = require('./models/User');
app.get('/api/seed', async (req, res, next) => {
  try {
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

    const results = [];
    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        results.push({ name: u.name, role: u.role, status: 'created' });
      } else {
        results.push({ name: u.name, role: u.role, status: 'already_exists' });
      }
    }

    res.json({ message: 'Seeding process successfully completed.', results });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed', details: error.message });
  }
});

// Base route for setup check
app.get('/', (req, res) => {
  res.json({ message: 'Clinic Management SaaS Backend is running successfully!' });
});

// Setup fallback route for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;

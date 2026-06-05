require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 5000;

// Start Server if not in production (Vercel will export the app directly)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

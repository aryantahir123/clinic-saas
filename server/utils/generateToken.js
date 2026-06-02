const jwt = require('jsonwebtoken');

/**
 * Generates a short-lived access JWT token
 * @param {string} userId - User database identifier
 * @param {string} role - User role
 * @returns {string} Signed JWT
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET || 'clinic_access_secret_key_2024',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generates a long-lived refresh JWT token
 * @param {string} userId - User database identifier
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'clinic_refresh_secret_key_2024',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};

const jwt = require('jsonwebtoken');

/**
 * Middleware to optionally verify a Bearer Access Token.
 * If present and valid, attaches req.user. If missing or invalid, ignores and continues.
 */
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'clinic_access_secret_key_2024'
      );
      
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
    } catch (error) {
      // Ignore token decoding errors for optional verification
    }
  }
  
  next();
};

module.exports = optionalVerifyToken;

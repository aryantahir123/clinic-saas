const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to verify a Bearer Access Token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'clinic_access_secret_key_2024'
    );
    
    // Attach user payload (id, role) to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

module.exports = verifyToken;

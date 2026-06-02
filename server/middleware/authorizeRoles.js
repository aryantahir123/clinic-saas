const { errorResponse } = require('../utils/apiResponse');

/**
 * Role authorization middleware factory
 * @param {...string} roles - Array of allowed user roles
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. Insufficient permissions.', 403);
    }
    next();
  };
};

module.exports = authorizeRoles;

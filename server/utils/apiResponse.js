/**
 * Sends a standard success API response
 * @param {Object} res - Express response object
 * @param {any} data - Data to send in response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Sends a standard error API response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 */
const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};

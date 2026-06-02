const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const optionalVerifyToken = require('../middleware/optionalVerifyToken');

// POST /api/auth/register (Uses optional token verification to allow patient signups but capture admins registering doctors)
router.post('/register', optionalVerifyToken, authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me (Protected route)
router.get('/me', verifyToken, authController.getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;

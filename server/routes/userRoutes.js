const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { register } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// 1. Guard all user management endpoints
router.use(verifyToken);

// GET /api/users/doctors (admin, receptionist) - MUST be declared before general parameterized paths
router.get('/doctors', authorizeRoles('admin', 'receptionist'), userController.getDoctors);

// GET /api/users (admin only)
router.get('/', authorizeRoles('admin'), userController.getAllUsers);

// POST /api/users (admin only - utilizes registration logic)
router.post('/', authorizeRoles('admin'), register);

// PUT /api/users/:id (admin only)
router.put('/:id', authorizeRoles('admin'), userController.updateUser);

// DELETE /api/users/:id (admin only)
router.delete('/:id', authorizeRoles('admin'), userController.deactivateUser);

// PUT /api/users/:id/subscription (admin only)
router.put('/:id/subscription', authorizeRoles('admin'), userController.updateSubscription);

module.exports = router;

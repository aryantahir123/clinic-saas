const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// 1. Guard all analytics routes
router.use(verifyToken);

// GET /api/analytics/admin (admin only)
router.get('/admin', authorizeRoles('admin'), analyticsController.getAdminStats);

// GET /api/analytics/doctor/:id (doctor, admin) - MUST be before general parameterized paths if any
router.get('/doctor/:id', authorizeRoles('doctor', 'admin'), analyticsController.getDoctorStats);

// GET /api/analytics/monthly (admin only)
router.get('/monthly', authorizeRoles('admin'), analyticsController.getMonthlyAppointments);

module.exports = router;

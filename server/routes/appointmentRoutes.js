const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// 1. Guard all appointment endpoints
router.use(verifyToken);

// GET /api/appointments (admin, doctor, receptionist)
router.get('/', authorizeRoles('admin', 'doctor', 'receptionist'), appointmentController.getAllAppointments);

// POST /api/appointments (receptionist, admin, patient)
router.post('/', authorizeRoles('receptionist', 'admin', 'patient'), appointmentController.bookAppointment);

// GET /api/appointments/today (doctor, receptionist) - MUST be before general /:id routes
router.get('/today', authorizeRoles('doctor', 'receptionist'), appointmentController.getTodaysAppointments);

// GET /api/appointments/doctor/:id (doctor, admin) - MUST be before general /:id routes
router.get('/doctor/:id', authorizeRoles('doctor', 'admin'), appointmentController.getDoctorAppointments);

// GET /api/appointments/patient/:id (patient, doctor, admin) - MUST be before general /:id routes
router.get('/patient/:id', authorizeRoles('patient', 'doctor', 'admin'), appointmentController.getPatientAppointments);

// PUT /api/appointments/:id (receptionist, admin, doctor)
router.put('/:id', authorizeRoles('receptionist', 'admin', 'doctor'), appointmentController.updateAppointment);

// PATCH /api/appointments/:id/status (doctor, receptionist)
router.patch('/:id/status', authorizeRoles('doctor', 'receptionist'), appointmentController.updateAppointmentStatus);

// DELETE /api/appointments/:id (receptionist, admin, patient)
router.delete('/:id', authorizeRoles('receptionist', 'admin', 'patient'), appointmentController.cancelAppointment);

module.exports = router;

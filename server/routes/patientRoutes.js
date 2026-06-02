const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// 1. Guard all patient endpoints
router.use(verifyToken);

// GET /api/patients (admin, doctor, receptionist)
router.get('/', authorizeRoles('admin', 'doctor', 'receptionist'), patientController.getAllPatients);

// POST /api/patients (receptionist, admin)
router.post('/', authorizeRoles('receptionist', 'admin'), patientController.createPatient);

// GET /api/patients/search (admin, doctor, receptionist) - MUST be placed before /:id route
router.get('/search', authorizeRoles('admin', 'doctor', 'receptionist'), patientController.searchPatients);

// GET /api/patients/:id (admin, doctor, receptionist, patient)
router.get('/:id', authorizeRoles('admin', 'doctor', 'receptionist', 'patient'), patientController.getPatientById);

// PUT /api/patients/:id (receptionist, admin, patient)
router.put('/:id', authorizeRoles('receptionist', 'admin', 'patient'), patientController.updatePatient);

// DELETE /api/patients/:id (admin only)
router.delete('/:id', authorizeRoles('admin'), patientController.deletePatient);

// GET /api/patients/:id/history (admin, doctor, patient)
router.get('/:id/history', authorizeRoles('admin', 'doctor', 'patient'), patientController.getPatientHistory);

module.exports = router;

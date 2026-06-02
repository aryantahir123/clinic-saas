const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

// 1. Guard all prescription endpoints
router.use(verifyToken);

// GET /api/prescriptions/patient/:patientId (doctor, admin, patient) - MUST be before general /:id routes
router.get(
  '/patient/:patientId',
  authorizeRoles('doctor', 'admin', 'patient'),
  prescriptionController.getPrescriptionsByPatient
);

// POST /api/prescriptions (doctor only)
router.post('/', authorizeRoles('doctor'), prescriptionController.createPrescription);

// GET /api/prescriptions/:id/pdf (doctor, patient, admin) - MUST be before general /:id route
router.get(
  '/:id/pdf',
  authorizeRoles('doctor', 'patient', 'admin'),
  prescriptionController.generatePrescriptionPDF
);

// GET /api/prescriptions/:id (doctor, admin, patient)
router.get(
  '/:id',
  authorizeRoles('doctor', 'admin', 'patient'),
  prescriptionController.getPrescriptionById
);

// PUT /api/prescriptions/:id (doctor - own only inside controller)
router.put('/:id', authorizeRoles('doctor'), prescriptionController.updatePrescription);

// DELETE /api/prescriptions/:id (admin, doctor - own only inside controller)
router.delete('/:id', authorizeRoles('admin', 'doctor'), prescriptionController.deletePrescription);

module.exports = router;

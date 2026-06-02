const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const checkSubscription = require('../middleware/checkSubscription');

// 1. All AI routing triggers authentication followed by Pro package check
router.use(verifyToken);
router.use(checkSubscription);

// POST /api/ai/symptom-check (doctors only)
router.post('/symptom-check', authorizeRoles('doctor'), aiController.symptomCheck);

// POST /api/ai/explain-prescription (doctors and patients)
router.post('/explain-prescription', authorizeRoles('doctor', 'patient'), aiController.explainPrescription);

// POST /api/ai/risk-flag (doctors only)
router.post('/risk-flag', authorizeRoles('doctor'), aiController.riskFlag);

module.exports = router;

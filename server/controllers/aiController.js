const DiagnosisLog = require('../models/DiagnosisLog');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * AI Symptom Checker
 * POST /api/ai/symptom-check
 */
const symptomCheck = async (req, res, next) => {
  try {
    const { symptoms, age, gender, history, patientId, appointmentId } = req.body;

    // 1. Inputs validation
    if (!symptoms || age === undefined || !gender || !patientId) {
      return errorResponse(res, 'Symptoms, age, gender, and patientId are required', 400);
    }

    // 2. Call Gemini AI symptom assessor
    const aiResult = await aiService.checkSymptoms({
      symptoms: Array.isArray(symptoms) ? symptoms.join(', ') : symptoms,
      age,
      gender,
      history: history || 'None',
    });

    // 3. Document symptom checking in DiagnosisLog
    const newLog = new DiagnosisLog({
      patientId,
      doctorId: req.user.id,
      appointmentId: appointmentId || undefined,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      aiResponse: {
        possibleConditions: aiResult.possibleConditions,
        riskLevel: aiResult.riskLevel,
        suggestedTests: aiResult.suggestedTests,
        recommendations: aiResult.recommendations,
      },
      fallbackUsed: !!aiResult.fallback,
    });

    await newLog.save();

    // 4. If AI flags High or Critical risk, elevate patient profile classification
    if (aiResult.riskLevel === 'high' || aiResult.riskLevel === 'critical') {
      await Patient.findByIdAndUpdate(patientId, { isHighRisk: true });
    }

    return successResponse(
      res,
      {
        aiResponse: aiResult,
        diagnosisLogId: newLog._id,
      },
      'Symptom assessment logged successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * AI Prescription Explainer (English / Urdu)
 * POST /api/ai/explain-prescription
 */
const explainPrescription = async (req, res, next) => {
  try {
    const { prescriptionId, language = 'en' } = req.body;

    if (!prescriptionId) {
      return errorResponse(res, 'Prescription ID is required', 400);
    }

    const prescription = await Prescription.findById(prescriptionId).populate('patientId');
    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    let explanation = '';

    // 1. Process explanation languages
    if (language === 'ur') {
      explanation = await aiService.explainPrescriptionUrdu({
        medicines: prescription.medicines,
        instructions: prescription.instructions || 'None',
        diagnosis: prescription.diagnosis || 'None',
        patientName: prescription.patientId.name,
      });
      prescription.aiExplanationUrdu = explanation;
    } else {
      explanation = await aiService.explainPrescription({
        medicines: prescription.medicines,
        instructions: prescription.instructions || 'None',
        diagnosis: prescription.diagnosis || 'None',
        patientName: prescription.patientId.name,
      });
      prescription.aiExplanation = explanation;
    }

    await prescription.save();

    return successResponse(
      res,
      { explanation },
      `Prescription explanation generated successfully in ${language === 'ur' ? 'Urdu' : 'English'}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * AI Risk Flag Assessor
 * POST /api/ai/risk-flag
 */
const riskFlag = async (req, res, next) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return errorResponse(res, 'Patient ID is required', 400);
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return errorResponse(res, 'Patient not found', 404);
    }

    // 1. Pull patient history elements (recent diagnoses from last 3 sessions)
    const recentLogs = await DiagnosisLog.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(3);

    const recentDiagnoses = recentLogs.map((log) =>
      log.aiResponse && log.aiResponse.possibleConditions
        ? log.aiResponse.possibleConditions.map((c) => c.name).join(', ')
        : ''
    );

    // 2. Process clinical assessment prompt
    const aiResult = await aiService.flagRisks({
      recentDiagnoses,
      chronicConditions: patient.chronicConditions || [],
      symptoms: recentLogs.length > 0 ? recentLogs[0].symptoms.join(', ') : 'None',
    });

    // 3. Commit elevated statuses and explanation reports to patient file
    if (aiResult.isHighRisk) {
      patient.isHighRisk = true;
      patient.riskNotes = aiResult.riskReasons
        ? aiResult.riskReasons.join('. ')
        : 'High clinical risk flagged by AI assessment.';
      await patient.save();
    }

    return successResponse(res, aiResult, 'AI Health risk assessor completed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  symptomCheck,
  explainPrescription,
  riskFlag,
};

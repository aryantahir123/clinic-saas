const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API client (safely handles dummy/missing keys via try/catch layers)
const apiKey = process.env.GEMINI_API_KEY || 'dummy_api_key';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Utility to clean markdown formatting blocks (e.g. ```json ... ```) from Gemini outputs
 */
const cleanJsonString = (str) => {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
};

/**
 * AI Symptom Checker
 * Analyzes patient symptoms, age, gender, and history to formulate possible conditions.
 */
const checkSymptoms = async ({ symptoms, age, gender, history }) => {
  try {
    const prompt = `You are a medical AI assistant. A doctor is consulting you.
Patient: Age ${age}, Gender ${gender}
Symptoms: ${symptoms}
Medical History: ${history}
Respond ONLY in valid JSON format (no markdown code blocks, do not include \`\`\`json):
{
  "possibleConditions": [
    { "name": "Condition Name", "probability": "High" or "Medium" or "Low", "description": "Brief description of condition" }
  ],
  "riskLevel": "low" or "medium" or "high" or "critical",
  "suggestedTests": ["Test name 1", "Test name 2"],
  "recommendations": "Advice summary"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJsonString(text));
    return parsed;
  } catch (error) {
    console.warn('⚠️ Gemini Symptom Checker Fallback Activated:', error.message);
    return {
      possibleConditions: [
        {
          name: 'AI Diagnostic Fallback',
          probability: 'Medium',
          description: 'Gemini service is currently offline or the API key is unconfigured.',
        },
      ],
      riskLevel: 'medium',
      suggestedTests: ['Routine physical examination', 'Standard blood panel'],
      recommendations: 'AI diagnostic suggestions are currently unavailable. Please perform a standard clinical diagnostic verification in person.',
    };
  }
};

/**
 * AI Prescription Explainer (English)
 * Explains doctor prescriptions in patient-friendly terms.
 */
const explainPrescription = async ({ medicines, instructions, diagnosis, patientName }) => {
  try {
    const medicinesStr = JSON.stringify(medicines);
    const prompt = `Explain this prescription in simple language for a patient named ${patientName}.
Medicines: ${medicinesStr}. Diagnosis: ${diagnosis}. Instructions: ${instructions}.
Respond in plain English in 3-4 sentences. Be friendly and clear.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.warn('⚠️ Gemini Prescription Explainer Fallback Activated:', error.message);
    return `Hello ${patientName}, your doctor has prescribed medications for ${diagnosis || 'your condition'}. Please refer to the printed dosage instructions on your prescription sheet, or consult your doctor/pharmacist directly for a personalized explanation.`;
  }
};

/**
 * AI Prescription Explainer (Urdu)
 * Explains doctor prescriptions in patient-friendly Urdu.
 */
const explainPrescriptionUrdu = async ({ medicines, instructions, diagnosis, patientName }) => {
  try {
    const medicinesStr = JSON.stringify(medicines);
    const prompt = `Explain this prescription in simple language for a patient named ${patientName} using Urdu language (Urdu script).
Medicines: ${medicinesStr}. Diagnosis: ${diagnosis}. Instructions: ${instructions}.
Respond in friendly and clear Urdu language in 3-4 sentences.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.warn('⚠️ Gemini Prescription Explainer Urdu Fallback Activated:', error.message);
    return `محترم ${patientName}، آپ کے معالج نے آپ کے مرض کے علاج کے لیے دوائیں تجویز کی ہیں۔ تفصیلی خوراک اور ہدایات کے لیے برائے مہربانی اپنے پرنٹ شدہ نسخے کو دیکھیں یا براہِ راست اپنے ڈاکٹر سے رابطہ کریں۔`;
  }
};

/**
 * AI Risk Assessor
 * Flag clinical risk criteria using recent diagnostics and chronic indicators.
 */
const flagRisks = async ({ recentDiagnoses, chronicConditions, symptoms }) => {
  try {
    const diagnosesStr = JSON.stringify(recentDiagnoses);
    const chronicStr = JSON.stringify(chronicConditions);
    const prompt = `Analyze these patient details for health risks.
Chronic conditions: ${chronicStr}
Recent diagnoses (last 3): ${diagnosesStr}
Current symptoms: ${symptoms}
Respond ONLY in JSON (no markdown code blocks, do not include \`\`\`json):
{
  "isHighRisk": true or false,
  "riskLevel": "low" or "medium" or "high" or "critical",
  "riskReasons": ["Reason 1", "Reason 2"],
  "recommendations": "Recommended clinical actions"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJsonString(text));
    return parsed;
  } catch (error) {
    console.warn('⚠️ Gemini Risk Assessor Fallback Activated:', error.message);
    return {
      isHighRisk: false,
      riskLevel: 'medium',
      riskReasons: ['Automated risk assessment fallback activated due to API limits/offline status.'],
      recommendations: 'Perform standard physical verification of patient chart indicators.',
      fallback: true,
    };
  }
};

module.exports = {
  checkSymptoms,
  explainPrescription,
  explainPrescriptionUrdu,
  flagRisks,
};

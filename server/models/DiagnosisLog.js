const mongoose = require('mongoose');

const possibleConditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Condition name is required'],
      trim: true,
    },
    probability: {
      type: String, // Can store as percentage (e.g. "85%") or decimal string
      required: [true, 'Condition probability is required'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const aiResponseSchema = new mongoose.Schema(
  {
    possibleConditions: {
      type: [possibleConditionSchema],
      default: [],
    },
    riskLevel: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid risk level',
      },
      required: [true, 'Risk level is required'],
    },
    suggestedTests: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const diagnosisLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    symptoms: {
      type: [String],
      required: [true, 'At least one symptom is required'],
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    aiResponse: {
      type: aiResponseSchema,
      required: [true, 'AI Response is required'],
    },
    fallbackUsed: {
      type: Boolean,
      default: false,
    },
    isRiskFlagged: {
      type: Boolean,
      default: false,
    },
    riskReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DiagnosisLog = mongoose.model('DiagnosisLog', diagnosisLogSchema);

module.exports = DiagnosisLog;

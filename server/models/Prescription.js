const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, 'Medicine dosage is required'],
    trim: true,
  },
  frequency: {
    type: String,
    required: [true, 'Medicine frequency is required'],
    trim: true,
  },
  duration: {
    type: String,
    required: [true, 'Medicine duration is required'],
    trim: true,
  },
  route: {
    type: String,
    default: 'Oral',
    trim: true,
  },
});

const prescriptionSchema = new mongoose.Schema(
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
    medicines: {
      type: [medicineSchema],
      default: [],
    },
    instructions: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    aiExplanation: {
      type: String,
      trim: true,
    },
    aiExplanationUrdu: {
      type: String,
      trim: true,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;

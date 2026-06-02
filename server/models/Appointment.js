const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booked by user reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    type: {
      type: String,
      enum: {
        values: ['checkup', 'followup', 'emergency'],
        message: '{VALUE} is not a valid appointment type',
      },
      default: 'checkup',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

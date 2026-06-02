const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Retrieve all appointments (Filterable, Paginated)
 * GET /api/appointments
 */
const getAllAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(searchDate.getDate() + 1);

      filter.date = { $gte: searchDate, $lt: nextDay };
    }

    const totalCount = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name specialization')
      .sort({ date: 1, timeSlot: 1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { appointments, totalCount, page, limit },
      'Appointments retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Book an appointment with collision safety check
 * POST /api/appointments
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, type, notes } = req.body;

    // 1. Validate required inputs
    if (!patientId || !doctorId || !date || !timeSlot) {
      return errorResponse(res, 'Patient, doctor, date, and time slot are required', 400);
    }

    // Parse date to start of day UTC
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // 2. Collision Check: Verify doctor has no active booking in the same date and timeslot
    const collision = await Appointment.findOne({
      doctorId,
      date: bookingDate,
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (collision) {
      return errorResponse(res, 'The doctor already has an appointment booked for this time slot.', 400);
    }

    // 3. Create appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      bookedBy: req.user.id,
      date: bookingDate,
      timeSlot,
      type: type || 'checkup',
      notes,
    });

    await newAppointment.save();

    return successResponse(res, newAppointment, 'Appointment booked successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment details (with collision check)
 * PUT /api/appointments/:id
 */
const updateAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot, type, notes, status, doctorId } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    const targetDoctor = doctorId || appointment.doctorId;
    const targetSlot = timeSlot || appointment.timeSlot;
    
    let targetDate = appointment.date;
    if (date) {
      targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
    }

    // 1. If modifying date, slot, or doctor, execute collision verification
    if (date || timeSlot || doctorId) {
      const collision = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctorId: targetDoctor,
        date: targetDate,
        timeSlot: targetSlot,
        status: { $ne: 'cancelled' },
      });

      if (collision) {
        return errorResponse(res, 'Time slot conflict: Doctor is busy at this slot.', 400);
      }
    }

    // 2. Apply modifications
    appointment.date = targetDate;
    appointment.timeSlot = targetSlot;
    if (doctorId) appointment.doctorId = doctorId;
    if (type) appointment.type = type;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;

    await appointment.save();

    return successResponse(res, appointment, 'Appointment updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status (PATCH status only)
 * PATCH /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    const currentStatus = appointment.status;

    // 1. Validation of allowed transitions:
    // pending -> confirmed, confirmed -> completed, any -> cancelled
    let isValid = false;
    if (status === 'cancelled') {
      isValid = true;
    } else if (currentStatus === 'pending' && status === 'confirmed') {
      isValid = true;
    } else if (currentStatus === 'confirmed' && status === 'completed') {
      isValid = true;
    }

    if (!isValid) {
      return errorResponse(
        res,
        `Invalid status transition from '${currentStatus}' to '${status}'.`,
        400
      );
    }

    appointment.status = status;
    await appointment.save();

    return successResponse(res, appointment, 'Appointment status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment (Soft cancellation)
 * DELETE /api/appointments/:id
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');
    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // 1. Patient role can only cancel their own appointments
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (
        !currentUser ||
        (appointment.patientId.email !== currentUser.email &&
          appointment.patientId.phone !== currentUser.phone)
      ) {
        return errorResponse(res, 'Access denied. You can only cancel your own appointments.', 403);
      }
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return successResponse(res, null, 'Appointment cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve doctor schedules (filtered)
 * GET /api/appointments/doctor/:id
 */
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    // 1. Restrict doctor role to viewing own appointments only
    if (req.user.role === 'doctor' && req.user.id !== doctorId) {
      return errorResponse(res, 'Access denied. Doctors can only view their own appointments.', 403);
    }

    const filter = { doctorId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(searchDate.getDate() + 1);

      filter.date = { $gte: searchDate, $lt: nextDay };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name phone age gender')
      .sort({ date: 1, timeSlot: 1 });

    return successResponse(res, appointments, 'Doctor appointments fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve patient appointments
 * GET /api/appointments/patient/:id
 */
const getPatientAppointments = async (req, res, next) => {
  try {
    let patient;
    if (req.params.id === 'me') {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return errorResponse(res, 'User not found', 404);
      }
      patient = await Patient.findOne({
        $or: [
          { email: currentUser.email },
          { phone: currentUser.phone }
        ],
        isActive: { $ne: false }
      });
    } else {
      patient = await Patient.findOne({ _id: req.params.id, isActive: { $ne: false } });
    }

    if (!patient) {
      return errorResponse(res, 'Patient not found', 404);
    }

    // 1. Restrict patient role to viewing own appointments only
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (
        !currentUser ||
        (patient.email !== currentUser.email && patient.phone !== currentUser.phone)
      ) {
        return errorResponse(res, 'Access denied. Patients can only view their own appointments.', 403);
      }
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });

    return successResponse(res, appointments, 'Patient appointments fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch daily schedule (today) for receptionist or doctors
 * GET /api/appointments/today
 */
const getTodaysAppointments = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const filter = {
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'cancelled' },
    };

    // 1. Doctors can only view their own schedule
    if (req.user.role === 'doctor') {
      filter.doctorId = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name phone age gender')
      .populate('doctorId', 'name specialization')
      .sort({ timeSlot: 1 });

    return successResponse(res, appointments, "Today's appointments fetched successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAppointments,
  bookAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getTodaysAppointments,
};

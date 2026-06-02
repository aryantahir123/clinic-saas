const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const DiagnosisLog = require('../models/DiagnosisLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Retrieve all patients (Paginated, Searchable)
 * GET /api/patients
 */
const getAllPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { isActive: { $ne: false } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('createdBy', 'name')
      .populate('assignedDoctor', 'name specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { patients, totalCount, page, limit },
      'Patients retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new patient record
 * POST /api/patients
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      allergies,
      chronicConditions,
      assignedDoctor,
      isHighRisk,
      riskNotes,
    } = req.body;

    // 1. Validate required fields
    if (!name || age === undefined || !gender || !phone) {
      return errorResponse(res, 'Name, age, gender, and phone are required', 400);
    }

    // 2. Build patient document
    const newPatient = new Patient({
      name,
      age,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      allergies,
      chronicConditions,
      createdBy: req.user.id,
      assignedDoctor: assignedDoctor || undefined,
      isHighRisk: isHighRisk || false,
      riskNotes,
    });

    await newPatient.save();

    return successResponse(res, newPatient, 'Patient created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve patient profile by ID (Secure owned verification)
 * GET /api/patients/:id
 */
const getPatientById = async (req, res, next) => {
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
      })
      .populate('createdBy', 'name')
      .populate('assignedDoctor', 'name specialization');
    } else {
      patient = await Patient.findOne({ _id: req.params.id, isActive: { $ne: false } })
        .populate('createdBy', 'name')
        .populate('assignedDoctor', 'name specialization');
    }

    if (!patient) {
      return errorResponse(res, 'Patient not found', 404);
    }

    // 1. Restrict patient role to viewing own profile only
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || (patient.email !== currentUser.email && patient.phone !== currentUser.phone)) {
        return errorResponse(res, 'Access denied. You can only view your own record.', 403);
      }
    }

    return successResponse(res, patient, 'Patient details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient record
 * PUT /api/patients/:id
 */
const updatePatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    let resolvedId = patientId;

    if (patientId === 'me') {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return errorResponse(res, 'User not found', 404);
      }
      const p = await Patient.findOne({
        $or: [
          { email: currentUser.email },
          { phone: currentUser.phone }
        ],
        isActive: { $ne: false }
      });
      if (!p) {
        return errorResponse(res, 'Patient profile not found', 404);
      }
      resolvedId = p._id;
    }

    const patientRecord = await Patient.findById(resolvedId);
    if (!patientRecord) {
      return errorResponse(res, 'Patient not found', 404);
    }

    // 1. Restrict patient role to editing own profile only, and only contact fields: phone, email, address
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || (patientRecord.email !== currentUser.email && patientRecord.phone !== currentUser.phone)) {
        return errorResponse(res, 'Access denied. You can only update your own profile.', 403);
      }

      const allowedFields = ['phone', 'email', 'address'];
      const updates = Object.keys(req.body);
      const isAllowed = updates.every(field => allowedFields.includes(field));

      if (!isAllowed) {
        return errorResponse(res, 'Access denied. Patients can only update phone, email, and address.', 400);
      }
    }

    // 2. Ensure createdBy is unalterable
    if (req.body.createdBy) {
      delete req.body.createdBy;
    }

    const patient = await Patient.findOneAndUpdate(
      { _id: resolvedId, isActive: { $ne: false } },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name')
      .populate('assignedDoctor', 'name specialization');

    return successResponse(res, patient, 'Patient record updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete patient record
 * DELETE /api/patients/:id
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return errorResponse(res, 'Patient not found', 404);
    }

    return successResponse(res, null, 'Patient deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve patient's comprehensive history
 * GET /api/patients/:id/history
 */
const getPatientHistory = async (req, res, next) => {
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

    // 1. Verify owned access for patient roles
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || (patient.email !== currentUser.email && patient.phone !== currentUser.phone)) {
        return errorResponse(res, 'Access denied. You can only view your own history.', 403);
      }
    }

    const patientId = patient._id;

    // 2. Fetch history records sorted descending
    const appointments = await Appointment.find({ patientId })
      .sort({ date: -1 })
      .populate('doctorId', 'name specialization');

    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name specialization');

    const diagnosisLogs = await DiagnosisLog.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name');

    return successResponse(
      res,
      { appointments, prescriptions, diagnosisLogs },
      'Patient history logs retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Search patients by autocomplete query
 * GET /api/patients/search
 */
const searchPatients = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    
    const query = { isActive: { $ne: false } };
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const results = await Patient.find(query)
      .select('_id name phone age gender')
      .limit(10);

    return successResponse(res, results, 'Patients autocomplete search results');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientHistory,
  searchPatients,
};

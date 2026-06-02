const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Create a new digital prescription (Doctors only)
 * POST /api/prescriptions
 */
const createPrescription = async (req, res, next) => {
  try {
    const {
      patientId,
      appointmentId,
      medicines,
      instructions,
      diagnosis,
      followUpDate,
      aiExplanation,
      aiExplanationUrdu,
    } = req.body;

    // 1. Validate required fields
    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return errorResponse(res, 'Patient reference and at least one medicine is required', 400);
    }

    // 2. Validate medicine sub-documents
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return errorResponse(
          res,
          'Each medicine must specify: name, dosage, frequency, and duration',
          400
        );
      }
    }

    // 3. Create prescription
    const newPrescription = new Prescription({
      patientId,
      doctorId: req.user.id,
      appointmentId: appointmentId || undefined,
      medicines,
      instructions,
      diagnosis,
      followUpDate,
      aiExplanation,
      aiExplanationUrdu,
    });

    await newPrescription.save();

    return successResponse(res, newPrescription, 'Prescription logged successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve patient prescriptions
 * GET /api/prescriptions/patient/:patientId
 */
const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    let patient;
    if (req.params.patientId === 'me') {
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
      patient = await Patient.findOne({ _id: req.params.patientId, isActive: { $ne: false } });
    }

    if (!patient) {
      return errorResponse(res, 'Patient not found', 404);
    }

    // 1. Restrict patient role to viewing own prescriptions only
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (
        !currentUser ||
        (patient.email !== currentUser.email && patient.phone !== currentUser.phone)
      ) {
        return errorResponse(res, 'Access denied. You can only view your own prescriptions.', 403);
      }
    }

    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name age')
      .sort({ createdAt: -1 });

    return successResponse(res, prescriptions, 'Prescriptions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get prescription by ID
 * GET /api/prescriptions/:id
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name specialization licenseNumber')
      .populate('patientId');

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    // 1. Restrict patient role to viewing own prescriptions only
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (
        !currentUser ||
        (prescription.patientId.email !== currentUser.email &&
          prescription.patientId.phone !== currentUser.phone)
      ) {
        return errorResponse(res, 'Access denied. You can only view your own prescriptions.', 403);
      }
    }

    return successResponse(res, prescription, 'Prescription retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update prescription (Doctor - own prescriptions only)
 * PUT /api/prescriptions/:id
 */
const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    // 1. Restrict modifications exclusively to the issuing physician
    if (prescription.doctorId.toString() !== req.user.id) {
      return errorResponse(res, 'Access denied. You can only modify your own prescriptions.', 403);
    }

    const { medicines, instructions, diagnosis, followUpDate } = req.body;

    if (medicines) {
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return errorResponse(res, 'At least one medicine is required', 400);
      }
      for (const med of medicines) {
        if (!med.name || !med.dosage || !med.frequency || !med.duration) {
          return errorResponse(
            res,
            'Each medicine must specify: name, dosage, frequency, and duration',
            400
          );
        }
      }
      prescription.medicines = medicines;
    }

    if (instructions !== undefined) prescription.instructions = instructions;
    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (followUpDate !== undefined) prescription.followUpDate = followUpDate;

    await prescription.save();

    return successResponse(res, prescription, 'Prescription updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Hard delete prescription
 * DELETE /api/prescriptions/:id
 */
const deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    // 1. Restrict delete privileges to admin or the issuing physician
    if (req.user.role !== 'admin' && prescription.doctorId.toString() !== req.user.id) {
      return errorResponse(res, 'Access denied. You can only delete your own prescriptions.', 403);
    }

    await Prescription.findByIdAndDelete(req.params.id);

    return successResponse(res, null, 'Prescription deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a PDF document for prescription downloads
 * GET /api/prescriptions/:id/pdf
 */
const generatePrescriptionPDF = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId');

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    // 1. Restrict patients to viewing own records only
    if (req.user.role === 'patient') {
      const currentUser = await User.findById(req.user.id);
      if (
        !currentUser ||
        (prescription.patientId.email !== currentUser.email &&
          prescription.patientId.phone !== currentUser.phone)
      ) {
        return errorResponse(res, 'Access denied. You can only view your own prescriptions.', 403);
      }
    }

    // 2. Initialize PDFKit document with elegant margins
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set standard download headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${prescription._id}.pdf`);

    doc.pipe(res);

    // Header bar Design
    doc
      .fillColor('#0EA5E9')
      .fontSize(26)
      .font('Helvetica-Bold')
      .text('ClinicAI', 50, 50, { continued: true })
      .fillColor('#0F172A')
      .font('Helvetica')
      .text(' — Digital Prescription');

    doc.moveDown(0.5);

    // Decorative divider line
    doc
      .strokeColor('#E2E8F0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    
    doc.moveDown(1.5);

    // Columns Grid - Info Sections
    const yPos = doc.y;

    // Doctor Column (Left)
    doc
      .fontSize(12)
      .fillColor('#0EA5E9')
      .font('Helvetica-Bold')
      .text('DOCTOR INFORMATION', 50, yPos);
    
    doc
      .fontSize(10)
      .fillColor('#334155')
      .font('Helvetica')
      .text(`Name: Dr. ${prescription.doctorId.name}`, 50, doc.y + 6)
      .text(`Specialization: ${prescription.doctorId.specialization || 'General Practitioner'}`)
      .text(`License Number: ${prescription.doctorId.licenseNumber || 'N/A'}`);

    // Patient Column (Right)
    doc
      .fontSize(12)
      .fillColor('#0EA5E9')
      .font('Helvetica-Bold')
      .text('PATIENT INFORMATION', 300, yPos);

    doc
      .fontSize(10)
      .fillColor('#334155')
      .font('Helvetica')
      .text(`Name: ${prescription.patientId.name}`, 300, doc.y + 6)
      .text(`Age / Gender: ${prescription.patientId.age} years / ${prescription.patientId.gender}`)
      .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);

    doc.moveDown(3.5);
    doc.x = 50;

    // Diagnosis section
    if (prescription.diagnosis) {
      doc
        .fontSize(12)
        .fillColor('#0F172A')
        .font('Helvetica-Bold')
        .text('DIAGNOSIS');
      
      doc
        .fontSize(10)
        .fillColor('#475569')
        .font('Helvetica')
        .text(prescription.diagnosis, 50, doc.y + 5);

      doc.moveDown(2);
    }

    // Medicines Table Section
    doc
      .fontSize(12)
      .fillColor('#0EA5E9')
      .font('Helvetica-Bold')
      .text('Rx (MEDICINES)');
    
    doc.moveDown(0.5);

    // Table Headers
    const tableHeaderY = doc.y;
    doc.fontSize(10).fillColor('#0F172A').font('Helvetica-Bold');
    doc.text('Medicine Name', 50, tableHeaderY, { width: 160 });
    doc.text('Dosage', 210, tableHeaderY, { width: 80 });
    doc.text('Frequency', 290, tableHeaderY, { width: 90 });
    doc.text('Duration', 380, tableHeaderY, { width: 80 });
    doc.text('Route', 460, tableHeaderY, { width: 80 });

    doc.moveDown(0.3);
    
    doc
      .strokeColor('#94A3B8')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(0.6);

    // Table Rows
    doc.fillColor('#334155').font('Helvetica');
    for (const med of prescription.medicines) {
      const rowY = doc.y;
      
      doc.text(med.name, 50, rowY, { width: 160 });
      doc.text(med.dosage, 210, rowY, { width: 80 });
      doc.text(med.frequency, 290, rowY, { width: 90 });
      doc.text(med.duration, 380, rowY, { width: 80 });
      doc.text(med.route || 'Oral', 460, rowY, { width: 80 });

      doc.moveDown(0.8);
    }

    doc.moveDown(1.5);

    // Instructions Section
    if (prescription.instructions) {
      doc
        .fontSize(12)
        .fillColor('#0F172A')
        .font('Helvetica-Bold')
        .text('INSTRUCTIONS');
      
      doc
        .fontSize(10)
        .fillColor('#475569')
        .font('Helvetica')
        .text(prescription.instructions, 50, doc.y + 5);

      doc.moveDown(2);
    }

    // Follow-up Date Info
    if (prescription.followUpDate) {
      doc
        .fontSize(10)
        .fillColor('#10B981')
        .font('Helvetica-Bold')
        .text(`Follow-up Date Scheduled: ${new Date(prescription.followUpDate).toLocaleDateString()}`);
      
      doc.moveDown(1);
    }

    // Footer section
    const footerY = 740;
    doc
      .strokeColor('#E2E8F0')
      .lineWidth(1)
      .moveTo(50, footerY)
      .lineTo(545, footerY)
      .stroke();

    doc
      .fontSize(8)
      .fillColor('#94A3B8')
      .font('Helvetica')
      .text('Generated by ClinicAI — AI-Powered Clinic Management System', 50, footerY + 10, {
        align: 'center',
      });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  generatePrescriptionPDF,
};

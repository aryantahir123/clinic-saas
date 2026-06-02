const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Retrieve business and clinical KPIs for administrator dashboards
 * GET /api/analytics/admin
 */
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Get fundamental counts
    const totalPatients = await Patient.countDocuments({ isActive: { $ne: false } });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: { $ne: false } });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // 2. Aggregate monthly appointment trends for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAppointmentsGroup = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAppointments = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyAppointments.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
        count: 0,
      });
    }

    for (const item of monthlyAppointmentsGroup) {
      const match = monthlyAppointments.find(
        (m) => m.year === item._id.year && m.monthNum === item._id.month
      );
      if (match) {
        match.count = item.count;
      }
    }

    const formattedMonthly = monthlyAppointments.map((m) => ({
      month: m.month,
      count: m.count,
    }));

    // 3. Aggregate top 5 diagnosed conditions from prescriptions
    const topDiagnosesGroup = await Prescription.aggregate([
      { $match: { diagnosis: { $ne: '', $exists: true } } },
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const topDiagnoses = topDiagnosesGroup.map((item) => item._id);

    // 4. Calculate simulated revenue (completed appointments * 500 PKR)
    const completedTotal = await Appointment.countDocuments({ status: 'completed' });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const completedMonthly = await Appointment.countDocuments({
      status: 'completed',
      date: { $gte: startOfMonth },
    });

    const simulatedRevenue = {
      monthly: completedMonthly * 500,
      total: completedTotal * 500,
    };

    return successResponse(
      res,
      {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        monthlyAppointments: formattedMonthly,
        topDiagnoses,
        simulatedRevenue,
      },
      'Administrative analytics compiled successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve personal clinical stats for Doctors
 * GET /api/analytics/doctor/:id
 */
const getDoctorStats = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    // 1. Enforce doctor viewing restriction (admins exempt)
    if (req.user.role === 'doctor' && req.user.id !== doctorId) {
      return errorResponse(res, 'Access denied. You can only view your own statistics.', 403);
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Today's appointments count
    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'cancelled' },
    });

    // Completed today count
    const completedToday = await Appointment.countDocuments({
      doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: 'completed',
    });

    // Current month count
    const monthlyAppointments = await Appointment.countDocuments({
      doctorId,
      date: { $gte: startOfMonth },
    });

    // Total prescriptions signed
    const totalPrescriptions = await Prescription.countDocuments({ doctorId });

    // Aggregate appointments by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const appointmentsByDayGroup = await Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          date: { $gte: sevenDaysAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const appointmentsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const match = appointmentsByDayGroup.find(
        (item) =>
          item._id.year === day.getFullYear() &&
          item._id.month === day.getMonth() + 1 &&
          item._id.day === day.getDate()
      );

      appointmentsByDay.push({
        date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: match ? match.count : 0,
      });
    }

    return successResponse(
      res,
      {
        todayAppointments,
        completedToday,
        monthlyAppointments,
        totalPrescriptions,
        appointmentsByDay,
      },
      'Doctor clinical statistics compiled successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve monthly appointment aggregates for the last 12 months (charts)
 * GET /api/analytics/monthly
 */
const getMonthlyAppointments = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAppointmentsGroup = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAppointments = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyAppointments.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
        count: 0,
      });
    }

    for (const item of monthlyAppointmentsGroup) {
      const match = monthlyAppointments.find(
        (m) => m.year === item._id.year && m.monthNum === item._id.month
      );
      if (match) {
        match.count = item.count;
      }
    }

    const formattedMonthly = monthlyAppointments.map((m) => ({
      month: m.month,
      count: m.count,
    }));

    return successResponse(
      res,
      formattedMonthly,
      'Annual appointment trend chart logs compiled successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getDoctorStats,
  getMonthlyAppointments,
};

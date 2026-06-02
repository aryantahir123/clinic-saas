const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all active users
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: { $ne: false } }).select('-password -refreshToken');
    return successResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * List only doctor profiles (for schedulers/booking forms)
 * GET /api/users/doctors
 */
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: { $ne: false } }).select(
      '_id name email phone specialization licenseNumber avatar'
    );
    return successResponse(res, doctors, 'Doctor profiles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user information
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, avatar, specialization, licenseNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, avatar, specialization, licenseNumber },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user (Soft deactivation)
 * DELETE /api/users/:id
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, null, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update subscription membership plan
 * PUT /api/users/:id/subscription
 */
const updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionPlan, subscriptionExpiry } = req.body;

    if (!subscriptionPlan || !['free', 'pro'].includes(subscriptionPlan)) {
      return errorResponse(res, "Subscription plan must be 'free' or 'pro'", 400);
    }

    let expiryDate = null;
    if (subscriptionPlan === 'pro') {
      // Default to 30 days if not explicitly defined
      expiryDate = subscriptionExpiry
        ? new Date(subscriptionExpiry)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionPlan, subscriptionExpiry: expiryDate },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, `Subscription upgraded to ${subscriptionPlan} successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getDoctors,
  updateUser,
  deactivateUser,
  updateSubscription,
};

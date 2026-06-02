const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to check if the authenticated user has a 'pro' subscription plan.
 * Premium AI features are locked behind this middleware.
 */
const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.role !== 'patient' && user.subscriptionPlan !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'This feature requires a Pro plan.',
        upgradeRequired: true,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkSubscription;

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialization, licenseNumber } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      return errorResponse(res, 'Name, email, password, and role are required', 400);
    }

    // 2. Check if role is doctor or receptionist, restricted to Admin only
    if (role === 'doctor' || role === 'receptionist') {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied. Only administrators can register doctors or receptionists.', 403);
      }
    }

    // 3. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    // 4. Create and save new user
    const newUser = new User({
      name,
      email,
      password,
      role,
      phone,
      specialization: role === 'doctor' ? specialization : undefined,
      licenseNumber: role === 'doctor' ? licenseNumber : undefined,
    });

    await newUser.save();

    // 5. Exclude password and refreshToken implicitly via the schema toJSON transform
    const userData = newUser.toJSON();

    return successResponse(res, userData, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate a user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // 3. Check if active
    if (!user.isActive) {
      return errorResponse(res, 'Account deactivated', 403);
    }

    // 4. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // 5. Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // 6. Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // 7. Return payload
    return successResponse(
      res,
      {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          avatar: user.avatar,
        },
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh expired access tokens
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'clinic_refresh_secret_key_2024'
      );
    } catch (err) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new short-lived access token
    const accessToken = generateAccessToken(user._id, user.role);

    return successResponse(res, { accessToken }, 'Access token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Invalidate a user refresh token on logout
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch authenticated user data
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password - Send OTP
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiry (15 mins)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send Email
    const message = `You requested a password reset. Please use the following OTP to reset your password:\n\n${otp}\n\nThis OTP is valid for 15 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP',
        message,
      });

      // Output for dev purpose
      console.log(`OTP for ${user.email} is ${otp}`);

      return successResponse(res, null, 'OTP sent to email', 200);
    } catch (err) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      await user.save();

      return errorResponse(res, 'Email could not be sent', 500);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password with OTP
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(res, 'Email, OTP and new password are required', 400);
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    return successResponse(res, null, 'Password reset successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};

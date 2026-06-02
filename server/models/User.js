const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'doctor', 'receptionist', 'patient'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: '',
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    subscriptionExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordOTPExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password with bcryptjs (saltRounds = 12)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// toJSON transform to remove sensitive fields from responses
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

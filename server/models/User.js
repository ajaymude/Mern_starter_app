import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      index: true, // Index for faster email lookups
    },
    password: {
      type: String,
      required: function() {
        return !this.isGoogleAuth;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    picture: {
      type: String,
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns (optimized for high traffic)
userSchema.index({ email: 1 }); // Already unique, but explicit index
userSchema.index({ createdAt: -1 }); // For sorting by creation date
userSchema.index({ googleId: 1 }, { sparse: true }); // Index for Google auth lookups
userSchema.index({ email: 1, isGoogleAuth: 1 }); // Compound index for email + Google auth queries
userSchema.index({ _id: 1, email: 1 }); // Compound index for user lookups with email

// Hash password before saving (skip for Google auth users)
userSchema.pre('save', async function (next) {
  // Skip password hashing for Google auth users or if password not modified
  if (!this.isModified('password') || this.isGoogleAuth) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;


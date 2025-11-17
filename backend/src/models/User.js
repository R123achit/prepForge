import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['CANDIDATE', 'INTERVIEWER', 'ADMIN'],
      default: 'CANDIDATE',
    },
    subscription: {
      type: String,
      enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
      default: 'FREE',
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: 'General',
    },
    // Interviewer-specific fields
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalInterviewsConducted: {
      type: Number,
      default: 0,
    },
    // Analytics
    totalAIInterviews: {
      type: Number,
      default: 0,
    },
    totalLiveInterviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform output to match frontend types
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    subscription: user.subscription,
    profileImage: user.profileImage,
    bio: user.bio,
    skills: user.skills,
    specialization: user.specialization,
    rating: user.rating,
    createdAt: user.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;

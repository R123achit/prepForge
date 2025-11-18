import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import calendarService from '../services/calendarService.js';
import CalendarIntegration from '../models/CalendarIntegration.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role')
      .optional()
      .isIn(['CANDIDATE', 'INTERVIEWER', 'ADMIN'])
      .withMessage('Invalid role'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create user (password will be hashed by pre-save hook)
      const user = await User.create({
        email: email.toLowerCase(),
        password: password,
        firstName,
        lastName,
        role: role || 'CANDIDATE',
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user (explicitly select password field)
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePhoto: user.profilePhoto,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePhoto: user.profilePhoto,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        totalAIInterviews: user.totalAIInterviews,
        totalLiveInterviews: user.totalLiveInterviews,
        averageScore: user.averageScore,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  ],
  validate,
  async (req, res) => {
    try {
      const updates = {};
      const allowedFields = [
        'firstName',
        'lastName',
        'phone',
        'bio',
        'skills',
        'experience',
        'education',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // Handle email separately (check for duplicates)
      if (req.body.email) {
        const emailExists = await User.findOne({
          email: req.body.email.toLowerCase(),
          _id: { $ne: req.user._id },
        });
        if (emailExists) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        updates.email = req.body.email.toLowerCase();
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePhoto: user.profilePhoto,
          phone: user.phone,
          bio: user.bio,
          skills: user.skills,
          experience: user.experience,
          education: user.education,
        },
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Server error updating profile' });
    }
  }
);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Server error changing password' });
    }
  }
);

// Google Calendar OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/calendar-sync?error=no_code`);
    }

    // Get access token from Google
    const result = await calendarService.getGoogleAccessToken(code);
    
    if (!result.success) {
      return res.redirect(`${process.env.FRONTEND_URL}/calendar-sync?error=token_failed`);
    }

    // For now, redirect with success - in real app, you'd need to associate with user
    // You might need to pass user ID in state parameter
    res.redirect(`${process.env.FRONTEND_URL}/calendar-sync?success=google_connected`);
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/calendar-sync?error=callback_failed`);
  }
});

export default router;
import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').optional().isIn(['CANDIDATE', 'INTERVIEWER', 'ADMIN']).withMessage('Invalid role'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create user
      const user = await User.create({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        role: role || 'CANDIDATE',
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user and include password
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user profile
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put(
  '/profile',
  protect,
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('bio').optional().isString(),
    body('skills').optional().isString(),
    body('profileImage').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { firstName, lastName, bio, skills, profileImage } = req.body;

      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (bio !== undefined) updateData.bio = bio;
      if (skills !== undefined) updateData.skills = skills;
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json(user.toJSON());
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      
      const isPasswordMatch = await user.comparePassword(currentPassword);
      if (!isPasswordMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

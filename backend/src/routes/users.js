import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import { validate } from '../middleware/errorHandler.js';

const router = express.Router();

// Lookup user by email (for finding interviewers)
router.get('/lookup', [
  body('email').optional().isEmail().withMessage('Invalid email'),
], validate, async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('firstName lastName email role profileImage');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Get available interviewers (public or semi-public endpoint)
router.get('/interviewers', async (req, res, next) => {
  try {
    const { limit = 20, page = 1, skills } = req.query;

    const query = { role: 'INTERVIEWER' };
    
    // Filter by skills if provided
    if (skills) {
      query.skills = { $regex: skills, $options: 'i' };
    }

    const interviewers = await User.find(query)
      .select('firstName lastName email bio skills rating totalInterviewsConducted profileImage')
      .sort({ rating: -1, totalInterviewsConducted: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      interviewers: interviewers.map((i) => i.toJSON()),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';

const router = express.Router();

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and GIF files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

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

// Upload profile photo
router.post('/profile-photo', protect, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res, next) => {
  try {
    console.log('Profile photo upload request:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete old profile photo if exists
    if (user.profileImage && fs.existsSync(user.profileImage)) {
      try {
        fs.unlinkSync(user.profileImage);
      } catch (deleteError) {
        console.warn('Failed to delete old profile image:', deleteError);
      }
    }

    user.profileImage = req.file.path;
    await user.save();

    console.log('Profile photo updated successfully:', user.profileImage);

    res.json({ 
      message: 'Profile photo updated successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError);
      }
    }
    next(error);
  }
});

// Get profile photo
router.get('/profile-photo/:userId', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('profileImage');
    
    if (!user || !user.profileImage || !fs.existsSync(user.profileImage)) {
      return res.status(404).json({ error: 'Profile photo not found' });
    }

    const ext = path.extname(user.profileImage).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const fileStream = fs.createReadStream(user.profileImage);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Users route is working' });
});

export default router;

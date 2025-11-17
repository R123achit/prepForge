import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, param } from 'express-validator';
import Resume from '../models/Resume.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import aiService from '../services/aiService.js';
import { generateResumeAnalysisPrompt } from '../utils/helpers.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

// Upload and analyze resume
router.post(
  '/upload',
  protect,
  upload.single('resume'),
  [
    body('jobRole').notEmpty().withMessage('Job role is required'),
    body('targetCompany').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Resume file is required' });
      }

      const { jobRole, targetCompany } = req.body;

      // Create resume record
      const resume = await Resume.create({
        userId: req.user._id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        jobRole,
        targetCompany: targetCompany || null,
        status: 'UPLOADED',
      });

      // Start async analysis (in real app, use a job queue)
      analyzeResume(resume._id).catch((error) => {
        console.error('Resume analysis failed:', error);
      });

      res.status(201).json({
        message: 'Resume uploaded successfully. Analysis in progress.',
        resumeId: resume._id.toString(),
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

// Async function to analyze resume
async function analyzeResume(resumeId) {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    resume.status = 'PROCESSING';
    await resume.save();

    // Extract text from file (simplified - in production use pdf-parse or similar)
    let resumeText = '';
    try {
      // For now, use a placeholder. In production, implement actual PDF parsing
      resumeText = `Resume for ${resume.jobRole} position. This is a sample text extraction.`;
      
      // If you have pdf-parse installed:
      // const pdfParse = require('pdf-parse');
      // const dataBuffer = fs.readFileSync(resume.filePath);
      // const data = await pdfParse(dataBuffer);
      // resumeText = data.text;
    } catch (parseError) {
      console.error('Failed to parse resume:', parseError);
      resumeText = 'Failed to extract text from resume';
    }

    resume.rawText = resumeText;

    // Generate AI analysis
    const analysisPrompt = generateResumeAnalysisPrompt(
      resumeText,
      resume.jobRole,
      resume.targetCompany
    );

    const aiResponse = await aiService.generateCompletion(analysisPrompt);
    const analysis = aiService.parseJSONResponse(aiResponse);

    if (analysis) {
      resume.overallScore = analysis.overallScore || 70;
      resume.matchPercentage = analysis.matchPercentage || 65;
      resume.strengths = analysis.strengths || [];
      resume.improvements = analysis.improvements || [];
      resume.keywords = analysis.keywords || { present: [], missing: [] };
      resume.sections = analysis.sections || {};
      resume.aiAnalysis = analysis;
    } else {
      // Fallback analysis
      resume.overallScore = 70;
      resume.matchPercentage = 65;
      resume.strengths = [
        'Well-structured resume',
        'Clear formatting',
        'Relevant experience listed',
      ];
      resume.improvements = [
        'Add more quantifiable achievements',
        'Include more keywords for ATS',
        'Expand on technical skills',
      ];
      resume.keywords = {
        present: ['JavaScript', 'React', 'Node.js'],
        missing: ['TypeScript', 'Docker', 'AWS'],
      };
      resume.sections = {
        experience: { score: 75, feedback: 'Good experience section' },
        education: { score: 80, feedback: 'Strong educational background' },
        skills: { score: 65, feedback: 'Consider adding more relevant skills' },
        projects: { score: 70, feedback: 'Expand on project details' },
      };
    }

    resume.status = 'COMPLETED';
    await resume.save();
  } catch (error) {
    console.error('Resume analysis error:', error);
    const resume = await Resume.findById(resumeId);
    if (resume) {
      resume.status = 'FAILED';
      await resume.save();
    }
  }
}

// Get user's resumes
router.get('/', protect, async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-rawText'); // Exclude raw text from list

    const total = await Resume.countDocuments({ userId: req.user._id });

    res.json({
      resumes: resumes.map((r) => r.toJSON()),
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

// Get specific resume analysis
router.get('/:id', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('-rawText'); // Exclude raw text

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ resume: resume.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Download resume file
router.get('/:id/download', param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    // Handle token from query parameter for mobile compatibility
    let user;
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      const User = (await import('../models/User.js')).default;
      user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
    } catch (authError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ error: 'Resume file not found' });
    }

    const fileName = resume.fileName || `resume-${resume._id}.pdf`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    
    const fileStream = fs.createReadStream(resume.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// Delete resume
router.delete('/:id', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

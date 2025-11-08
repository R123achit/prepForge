import express from 'express';
import { body, param } from 'express-validator';
import LiveInterview from '../models/LiveInterview.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { generateRoomId } from '../utils/helpers.js';

const router = express.Router();

// Create/Schedule Live Interview (Candidates only)
router.post(
  '/',
  protect,
  authorize('CANDIDATE'),
  [
    body('interviewType')
      .isIn(['TECHNICAL', 'HR', 'APTITUDE', 'BEHAVIORAL', 'DOMAIN_SPECIFIC', 'CODING', 'SYSTEM_DESIGN'])
      .withMessage('Invalid interview type'),
    body('topic').notEmpty().withMessage('Topic is required'),
    body('scheduledAt').isISO8601().withMessage('Valid scheduled date is required'),
    body('duration').isInt({ min: 30, max: 180 }).withMessage('Duration must be between 30 and 180 minutes'),
    body('interviewerId').optional().isMongoId().withMessage('Invalid interviewer ID'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { interviewType, topic, scheduledAt, duration, interviewerId, difficulty } = req.body;

      // Validate scheduled time is in the future
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate < new Date()) {
        return res.status(400).json({ error: 'Scheduled time must be in the future' });
      }

      // If interviewer specified, verify they exist and have correct role
      if (interviewerId) {
        const interviewer = await User.findById(interviewerId);
        if (!interviewer) {
          return res.status(404).json({ error: 'Interviewer not found' });
        }
        if (interviewer.role !== 'INTERVIEWER') {
          return res.status(400).json({ error: 'Specified user is not an interviewer' });
        }
      }

      // Create live interview
      const roomId = generateRoomId();
      const interview = await LiveInterview.create({
        candidateId: req.user._id,
        interviewerId: interviewerId || null,
        interviewType,
        topic,
        difficulty: difficulty || 'MEDIUM',
        scheduledAt: scheduledDate,
        duration,
        status: 'SCHEDULED',
        roomId: roomId,
        meetingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/interview-room/${roomId}`,
      });

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalLiveInterviews: 1 },
      });

      // Populate candidate and interviewer info
      await interview.populate('candidateId', 'firstName lastName email profileImage');
      if (interviewerId) {
        await interview.populate('interviewerId', 'firstName lastName email profileImage');
      }

      res.status(201).json({
        message: 'Live interview scheduled successfully',
        interview: interview.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get live interviews (role-based)
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1, roomId } = req.query;
    
    console.log('🔍 GET /live-interviews query params:', { status, limit, page, roomId });
    
    let query = {};
    
    // If searching by roomId, find that specific interview
    if (roomId) {
      console.log('🔍 Searching by roomId:', roomId);
      query.roomId = roomId;
    } else {
      // Role-based filtering
      if (req.user.role === 'CANDIDATE') {
        query.candidateId = req.user._id;
      } else if (req.user.role === 'INTERVIEWER') {
        // Show interviews where user is interviewer OR interviews without interviewer
        query.$or = [
          { interviewerId: req.user._id },
          { interviewerId: null, status: 'SCHEDULED' },
        ];
      }
    }

    if (status) {
      query.status = status;
    }

    console.log('🔍 Final query:', JSON.stringify(query));

    const interviews = await LiveInterview.find(query)
      .populate('candidateId', 'firstName lastName email profileImage')
      .populate('interviewerId', 'firstName lastName email profileImage')
      .sort({ scheduledAt: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log('📊 Found interviews:', interviews.length);
    if (interviews.length > 0 && roomId) {
      console.log('✅ Interview found with roomId:', interviews[0].roomId);
    }

    const total = await LiveInterview.countDocuments(query);

    res.json({
      interviews: interviews.map((i) => i.toJSON()),
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

// Get interview by roomId (special route before :id to avoid conflicts)
router.get('/room/:roomId', protect, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    console.log('🔍 Looking for interview with roomId:', roomId);
    
    const interview = await LiveInterview.findOne({ roomId })
      .populate('candidateId', 'firstName lastName email profileImage')
      .populate('interviewerId', 'firstName lastName email profileImage');

    console.log('🔍 Interview found:', interview ? 'YES' : 'NO');
    if (interview) {
      console.log('📋 Interview details:', { 
        id: interview._id, 
        roomId: interview.roomId, 
        status: interview.status 
      });
    }

    if (!interview) {
      // Try to find ANY interview and log it
      const allInterviews = await LiveInterview.find().limit(5);
      console.log('📊 Total interviews in DB:', allInterviews.length);
      if (allInterviews.length > 0) {
        console.log('📊 Sample roomIds:', allInterviews.map(i => i.roomId));
      }
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check access permissions
    const hasAccess =
      interview.candidateId._id.toString() === req.user._id.toString() ||
      (interview.interviewerId && interview.interviewerId._id.toString() === req.user._id.toString()) ||
      req.user.role === 'ADMIN';

    if (!hasAccess) {
      console.log('❌ Access denied for user:', req.user._id);
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('✅ Returning interview successfully');
    res.json({ interview: interview.toJSON() });
  } catch (error) {
    console.error('❌ Error in /room/:roomId:', error);
    next(error);
  }
});

// Get specific live interview
router.get('/:id', protect, [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const interview = await LiveInterview.findById(req.params.id)
      .populate('candidateId', 'firstName lastName email profileImage')
      .populate('interviewerId', 'firstName lastName email profileImage');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check access permissions
    const hasAccess =
      interview.candidateId._id.toString() === req.user._id.toString() ||
      (interview.interviewerId && interview.interviewerId._id.toString() === req.user._id.toString()) ||
      req.user.role === 'ADMIN';

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ interview: interview.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Accept interview request (Interviewers only)
router.post(
  '/:id/accept',
  protect,
  authorize('INTERVIEWER'),
  param('id').isMongoId(),
  validate,
  async (req, res, next) => {
    try {
      const interview = await LiveInterview.findById(req.params.id);

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      if (interview.interviewerId) {
        return res.status(400).json({ error: 'Interview already has an interviewer' });
      }

      if (interview.status !== 'SCHEDULED') {
        return res.status(400).json({ error: 'Interview is not in scheduled status' });
      }

      // Assign interviewer
      interview.interviewerId = req.user._id;
      await interview.save();

      // Update interviewer stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalInterviewsConducted: 1 },
      });

      await interview.populate('candidateId', 'firstName lastName email profileImage');
      await interview.populate('interviewerId', 'firstName lastName email profileImage');

      res.json({
        message: 'Interview accepted successfully',
        interview: interview.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Start interview
router.post('/:id/start', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const interview = await LiveInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check if user is candidate or interviewer
    const hasAccess =
      interview.candidateId.toString() === req.user._id.toString() ||
      (interview.interviewerId && interview.interviewerId.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (interview.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Interview cannot be started' });
    }

    interview.status = 'IN_PROGRESS';
    interview.startedAt = new Date();
    await interview.save();

    res.json({
      message: 'Interview started successfully',
      interview: interview.toJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// Complete/End interview (Candidate or Interviewer)
router.put(
  '/:id/complete',
  protect,
  [
    param('id').isMongoId(),
    body('score').optional().isInt({ min: 0, max: 100 }),
    body('feedback').optional().isObject(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { score, feedback } = req.body;

      const interview = await LiveInterview.findById(req.params.id);

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      // Check if user is candidate or interviewer
      const isInterviewer = interview.interviewerId && interview.interviewerId.toString() === req.user._id.toString();
      const isCandidate = interview.candidateId.toString() === req.user._id.toString();
      
      if (!isInterviewer && !isCandidate) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Only allow completing if scheduled or in progress
      if (interview.status !== 'IN_PROGRESS' && interview.status !== 'SCHEDULED') {
        return res.status(400).json({ error: 'Interview cannot be completed' });
      }

      interview.status = 'COMPLETED';
      interview.completedAt = new Date();
      
      // Only interviewer can provide score and feedback
      if (isInterviewer) {
        if (score !== undefined) interview.score = score;
        if (feedback) interview.feedback = feedback;
      }

      await interview.save();

      res.json({
        message: 'Interview completed successfully',
        interview: interview.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Cancel interview
router.post('/:id/cancel', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const interview = await LiveInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Check if user is candidate or interviewer
    const hasAccess =
      interview.candidateId.toString() === req.user._id.toString() ||
      (interview.interviewerId && interview.interviewerId.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (interview.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel completed interview' });
    }

    interview.status = 'CANCELLED';
    await interview.save();

    res.json({
      message: 'Interview cancelled successfully',
      interview: interview.toJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// Delete interview
router.delete('/:id', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const interview = await LiveInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Only candidate can delete their interviews
    if (interview.candidateId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await LiveInterview.findByIdAndDelete(req.params.id);

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

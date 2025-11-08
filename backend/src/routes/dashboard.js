import express from 'express';
import AIInterview from '../models/AIInterview.js';
import LiveInterview from '../models/LiveInterview.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Unified dashboard data endpoint
router.get('/unified', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dashboardData = {
      candidate: {
        upcoming: [],
        today: [],
        total: 0,
        completed: 0,
      },
      interviewer: {
        upcoming: [],
        today: [],
        total: 0,
        completed: 0,
        averageRating: req.user.rating || 0,
      },
      stats: {
        totalUpcoming: 0,
        totalCompleted: 0,
        pendingRequests: 0,
        todayTotal: 0,
      },
    };

    if (userRole === 'CANDIDATE') {
      // Candidate: Get their scheduled interviews
      const upcomingInterviews = await LiveInterview.find({
        candidateId: userId,
        status: 'SCHEDULED',
        scheduledAt: { $gte: now },
      })
        .populate('interviewerId', 'firstName lastName email profileImage')
        .sort({ scheduledAt: 1 })
        .limit(10);

      const todayInterviews = await LiveInterview.find({
        candidateId: userId,
        status: 'SCHEDULED',
        scheduledAt: { $gte: today, $lt: tomorrow },
      })
        .populate('interviewerId', 'firstName lastName email profileImage')
        .sort({ scheduledAt: 1 });

      // Count completed interviews (Live + AI)
      const completedLiveCount = await LiveInterview.countDocuments({
        candidateId: userId,
        status: 'COMPLETED',
      });

      const completedAICount = await AIInterview.countDocuments({
        userId: userId,
        status: 'COMPLETED',
      });

      const totalCompletedCount = completedLiveCount + completedAICount;

      // Awaiting confirmation (no interviewer assigned yet)
      const pendingCount = await LiveInterview.countDocuments({
        candidateId: userId,
        status: 'SCHEDULED',
        interviewerId: null,
      });

      dashboardData.candidate.upcoming = upcomingInterviews.map((i) => i.toJSON());
      dashboardData.candidate.today = todayInterviews.map((i) => i.toJSON());
      dashboardData.candidate.total = upcomingInterviews.length;
      dashboardData.candidate.completed = totalCompletedCount;

      dashboardData.stats.totalUpcoming = upcomingInterviews.length;
      dashboardData.stats.totalCompleted = totalCompletedCount;
      dashboardData.stats.pendingRequests = pendingCount;
      dashboardData.stats.todayTotal = todayInterviews.length;

    } else if (userRole === 'INTERVIEWER') {
      // Interviewer: Get interviews they're conducting + pending requests
      const upcomingInterviews = await LiveInterview.find({
        interviewerId: userId,
        status: 'SCHEDULED',
        scheduledAt: { $gte: now },
      })
        .populate('candidateId', 'firstName lastName email profileImage')
        .sort({ scheduledAt: 1 })
        .limit(10);

      const todayInterviews = await LiveInterview.find({
        interviewerId: userId,
        status: 'SCHEDULED',
        scheduledAt: { $gte: today, $lt: tomorrow },
      })
        .populate('candidateId', 'firstName lastName email profileImage')
        .sort({ scheduledAt: 1 });

      // Pending requests: interviews without interviewer
      const pendingRequests = await LiveInterview.find({
        interviewerId: null,
        status: 'SCHEDULED',
        scheduledAt: { $gte: now },
      })
        .populate('candidateId', 'firstName lastName email profileImage')
        .sort({ scheduledAt: 1 })
        .limit(10);

      // Count completed interviews (Live + AI for interviewer)
      const completedLiveCount = await LiveInterview.countDocuments({
        interviewerId: userId,
        status: 'COMPLETED',
      });

      const completedAICount = await AIInterview.countDocuments({
        userId: userId,
        status: 'COMPLETED',
      });

      const totalCompletedCount = completedLiveCount + completedAICount;

      dashboardData.interviewer.upcoming = pendingRequests.map((i) => i.toJSON());
      dashboardData.interviewer.today = todayInterviews.map((i) => i.toJSON());
      dashboardData.interviewer.total = upcomingInterviews.length + pendingRequests.length;
      dashboardData.interviewer.completed = totalCompletedCount;

      dashboardData.stats.totalUpcoming = upcomingInterviews.length;
      dashboardData.stats.totalCompleted = totalCompletedCount;
      dashboardData.stats.pendingRequests = pendingRequests.length;
      dashboardData.stats.todayTotal = todayInterviews.length;
    }

    res.json(dashboardData);
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // AI Interview stats
    const totalAIInterviews = await AIInterview.countDocuments({ userId });
    const completedAIInterviews = await AIInterview.countDocuments({
      userId,
      status: 'COMPLETED',
    });

    // Live Interview stats (role-dependent)
    let totalLiveInterviews = 0;
    let completedLiveInterviews = 0;

    if (req.user.role === 'CANDIDATE') {
      totalLiveInterviews = await LiveInterview.countDocuments({ candidateId: userId });
      completedLiveInterviews = await LiveInterview.countDocuments({
        candidateId: userId,
        status: 'COMPLETED',
      });
    } else if (req.user.role === 'INTERVIEWER') {
      totalLiveInterviews = await LiveInterview.countDocuments({ interviewerId: userId });
      completedLiveInterviews = await LiveInterview.countDocuments({
        interviewerId: userId,
        status: 'COMPLETED',
      });
    }

    // Average scores
    const aiInterviewsWithScores = await AIInterview.find({
      userId,
      status: 'COMPLETED',
      score: { $exists: true },
    });

    const avgAIScore =
      aiInterviewsWithScores.length > 0
        ? Math.round(
            aiInterviewsWithScores.reduce((sum, i) => sum + (i.score || 0), 0) /
              aiInterviewsWithScores.length
          )
        : 0;

    res.json({
      ai: {
        total: totalAIInterviews,
        completed: completedAIInterviews,
        averageScore: avgAIScore,
      },
      live: {
        total: totalLiveInterviews,
        completed: completedLiveInterviews,
      },
      overall: {
        totalInterviews: totalAIInterviews + totalLiveInterviews,
        completedInterviews: completedAIInterviews + completedLiveInterviews,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activity
router.get('/activity', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent AI interviews
    const recentAI = await AIInterview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select('interviewType topic status score createdAt');

    // Get recent live interviews
    let recentLive = [];
    if (req.user.role === 'CANDIDATE') {
      recentLive = await LiveInterview.find({ candidateId: userId })
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .select('interviewType topic status score scheduledAt')
        .populate('interviewerId', 'firstName lastName');
    } else if (req.user.role === 'INTERVIEWER') {
      recentLive = await LiveInterview.find({ interviewerId: userId })
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .select('interviewType topic status score scheduledAt')
        .populate('candidateId', 'firstName lastName');
    }

    // Combine and sort
    const activities = [
      ...recentAI.map((i) => ({
        type: 'AI',
        id: i._id.toString(),
        interviewType: i.interviewType,
        topic: i.topic,
        status: i.status,
        score: i.score,
        date: i.createdAt,
      })),
      ...recentLive.map((i) => ({
        type: 'LIVE',
        id: i._id.toString(),
        interviewType: i.interviewType,
        topic: i.topic,
        status: i.status,
        score: i.score,
        date: i.scheduledAt,
        participant: i.candidateId || i.interviewerId,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ activities: activities.slice(0, limit) });
  } catch (error) {
    next(error);
  }
});

// Accept interview request (Interviewer)
router.post('/interviewer/requests/:id/accept', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'INTERVIEWER') {
      return res.status(403).json({ error: 'Only interviewers can accept requests' });
    }

    const interview = await LiveInterview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.interviewerId) {
      return res.status(400).json({ error: 'Interview already has an interviewer' });
    }

    interview.interviewerId = req.user._id;
    await interview.save();

    res.json({ message: 'Interview accepted successfully', interview: interview.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Decline interview request (Interviewer)
router.post('/interviewer/requests/:id/decline', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'INTERVIEWER') {
      return res.status(403).json({ error: 'Only interviewers can decline requests' });
    }

    const interview = await LiveInterview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // For now, just return success. In production, you might want to:
    // - Add to a declined list
    // - Notify the candidate
    // - Remove from pending pool for this interviewer
    
    res.json({ message: 'Interview declined' });
  } catch (error) {
    next(error);
  }
});

export default router;

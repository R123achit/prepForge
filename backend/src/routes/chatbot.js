import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import aiService from '../services/aiService.js';
import { generateChatbotPrompt } from '../utils/helpers.js';

const router = express.Router();

// Chatbot endpoint
router.post(
  '/',
  protect,
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('context').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { message, context, userStats } = req.body;

      // Build user stats context if provided
      let statsContext = '';
      if (userStats) {
        statsContext = `\n\nUser's Current Statistics:
- Total AI Interviews: ${userStats.totalAIInterviews || 0}
- Total Live Interviews: ${userStats.totalLiveInterviews || 0}
- Average AI Score: ${userStats.averageScore || 'N/A'}%
- Recent Performance: ${userStats.recentPerformance || 'No data yet'}
- Completed Interviews: ${userStats.completedInterviews || 0}
- Pending Interviews: ${userStats.pendingInterviews || 0}`;
      }

      // Generate custom PrepForge chatbot prompt
      const systemContext = `You are PrepForge AI Assistant, an intelligent chatbot for PrepForge - an AI-powered interview preparation platform.

About PrepForge:
- AI Mock Interviews: Practice with AI interviewer, get instant feedback on answers
- Live Video Interviews: Real-time interviews with experienced professionals
- Resume Analysis: AI-powered resume optimization and ATS scoring
- Interactive Dashboard: Track progress and performance analytics
- Real-time Chat: Communication during live interviews
- Voice Recognition: Answer questions via voice or text${statsContext}

Your role:
- Help users with interview preparation tips and strategies
- Explain PrepForge features and how to use them
- Provide career guidance and resume advice
- Answer technical interview questions
- Give feedback on interview techniques
- Answer questions about their statistics and progress
- Be friendly, professional, and encouraging

User question: ${message}

Provide a helpful, concise response (2-3 paragraphs max). If they ask about their stats, use the data provided above:`;

      // Get AI response from Gemini
      const response = await aiService.generateCompletion(systemContext, {
        temperature: 0.8,
        maxTokens: 500,
      });

      res.json({
        response: response.trim(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get chatbot conversation history (optional feature)
router.get('/history', protect, async (req, res, next) => {
  try {
    // In a real app, you'd store conversation history in the database
    // For now, return empty array
    res.json({
      history: [],
      message: 'Conversation history feature coming soon',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

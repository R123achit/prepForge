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
      const { message, context } = req.body;

      // Generate chatbot prompt
      const prompt = generateChatbotPrompt(message, context || 'interview_preparation');

      // Get AI response
      let response = '';
      try {
        response = await aiService.generateCompletion(prompt, {
          temperature: 0.8,
          maxTokens: 500,
        });
      } catch (aiError) {
        console.error('Chatbot AI error:', aiError);
        // Provide fallback response
        response = `I understand you're asking about: "${message}". 
        
I'm here to help with:
• Interview preparation strategies
• Resume and portfolio tips
• Technical concept explanations
• Platform feature guidance
• Career advice

Could you please rephrase your question or let me know which specific area you'd like help with?`;
      }

      res.json({
        response,
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

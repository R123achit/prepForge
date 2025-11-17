import express from 'express';
import { body, param } from 'express-validator';
import AIInterview from '../models/AIInterview.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import aiService from '../services/aiService.js';
import ttsService from '../services/ttsService.js';
import {
  generateRoomId,
  generateInterviewQuestionsPrompt,
  generateResponseEvaluationPrompt,
  calculateInterviewScore,
} from '../utils/helpers.js';

const router = express.Router();



// Create AI Interview
router.post(
  '/',
  protect,
  [
    body('interviewType')
      .isIn(['TECHNICAL', 'HR', 'APTITUDE', 'BEHAVIORAL', 'DOMAIN_SPECIFIC', 'CODING', 'SYSTEM_DESIGN'])
      .withMessage('Invalid interview type'),
    body('topic').notEmpty().withMessage('Topic is required'),
    body('difficulty').optional().isIn(['EASY', 'MEDIUM', 'HARD']),
    body('duration').isInt({ min: 15, max: 120 }).withMessage('Duration must be between 15 and 120 minutes'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { interviewType, topic, difficulty, duration } = req.body;

      // Generate interview questions using AI
      const questionsPrompt = generateInterviewQuestionsPrompt(
        interviewType,
        topic,
        difficulty || 'MEDIUM',
        5
      );

      console.log('🤖 Generating questions with prompt:', questionsPrompt);
      
      let questions = [];
      try {
        const aiResponse = await aiService.generateCompletion(questionsPrompt);
        console.log('🤖 AI Response received:', aiResponse);
        
        const parsedQuestions = aiService.parseJSONResponse(aiResponse);
        console.log('🤖 Parsed questions:', parsedQuestions);
        
        if (parsedQuestions && Array.isArray(parsedQuestions)) {
          questions = parsedQuestions.map((q, index) => ({
            questionText: q.questionText || q.question || 'Sample question',
            questionType: 'OPEN_ENDED',
            expectedAnswer: q.expectedAnswer || q.answer || '',
            difficulty: difficulty || 'MEDIUM',
            topic,
            order: index + 1,
            timeAsked: new Date(),
          }));
          console.log('✅ Successfully generated', questions.length, 'questions from AI');
        } else {
          console.log('❌ AI response could not be parsed as questions array');
          throw new Error('Invalid AI response format');
        }
      } catch (aiError) {
        console.error('❌ AI question generation failed:', aiError.message);
        throw new Error(`Failed to generate AI questions: ${aiError.message}`);
      }

      // Create interview
      const interview = await AIInterview.create({
        userId: req.user._id,
        interviewType,
        topic,
        difficulty: difficulty || 'MEDIUM',
        duration,
        status: 'IN_PROGRESS',
        questions,
        startedAt: new Date(),
      });

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalAIInterviews: 1 },
      });

      res.status(201).json({
        message: 'AI Interview created successfully',
        interview: interview.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's AI interviews
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const interviews = await AIInterview.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AIInterview.countDocuments(query);

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

// Get specific AI interview
router.get('/:id', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const interview = await AIInterview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ interview: interview.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Submit response to a question
router.post(
  '/:id/responses',
  protect,
  [
    param('id').isMongoId(),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('responseText').notEmpty().withMessage('Response text is required'),
    body('responseTime').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { questionId, responseText, responseTime } = req.body;

      const interview = await AIInterview.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      if (interview.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Interview already completed' });
      }

      // Find the question by ID or index
      let question;
      if (questionId.startsWith('question_')) {
        // Handle index-based question ID
        const questionIndex = parseInt(questionId.split('_')[1]);
        question = interview.questions[questionIndex];
      } else {
        // Handle MongoDB ObjectId
        question = interview.questions.id(questionId);
      }
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // Evaluate response using AI
      let evaluation = {
        technicalScore: 70,
        communicationScore: 75,
        confidence: 70,
        feedback: 'Good response. Keep practicing!',
        strengths: ['Clear communication'],
        improvements: ['Add more specific examples'],
      };

      try {
        const evaluationPrompt = generateResponseEvaluationPrompt(
          question.questionText,
          responseText,
          interview.interviewType
        );
        const aiResponse = await aiService.generateCompletion(evaluationPrompt);
        const parsedEvaluation = aiService.parseJSONResponse(aiResponse);
        
        if (parsedEvaluation) {
          evaluation = { ...evaluation, ...parsedEvaluation };
        }
      } catch (aiError) {
        console.error('AI evaluation failed:', aiError.message);
        // Use default evaluation
      }

      // Add response
      interview.responses.push({
        questionId,
        responseText,
        responseTime: responseTime || 0,
        confidence: evaluation.confidence,
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        aiAnalysis: evaluation,
      });

      await interview.save();

      res.json({
        message: 'Response submitted successfully',
        evaluation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Complete interview and generate final feedback
router.post('/:id/complete', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const interview = await AIInterview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Interview already completed' });
    }

    // Calculate overall score
    const score = calculateInterviewScore(interview.responses);

    // Generate comprehensive feedback
    const feedback = {
      overallScore: score,
      technicalAverage: Math.round(
        interview.responses.reduce((sum, r) => sum + (r.technicalScore || 0), 0) /
          (interview.responses.length || 1)
      ),
      communicationAverage: Math.round(
        interview.responses.reduce((sum, r) => sum + (r.communicationScore || 0), 0) /
          (interview.responses.length || 1)
      ),
      confidenceAverage: Math.round(
        interview.responses.reduce((sum, r) => sum + (r.confidence || 0), 0) /
          (interview.responses.length || 1)
      ),
      totalQuestions: interview.questions.length,
      answeredQuestions: interview.responses.length,
      strengths: [],
      improvements: [],
      summary: `You scored ${score}% in this ${interview.interviewType} interview on ${interview.topic}.`,
    };

    // Aggregate strengths and improvements from all responses
    interview.responses.forEach((response) => {
      if (response.aiAnalysis?.strengths) {
        feedback.strengths.push(...response.aiAnalysis.strengths);
      }
      if (response.aiAnalysis?.improvements) {
        feedback.improvements.push(...response.aiAnalysis.improvements);
      }
    });

    // Remove duplicates
    feedback.strengths = [...new Set(feedback.strengths)].slice(0, 5);
    feedback.improvements = [...new Set(feedback.improvements)].slice(0, 5);

    // Update interview
    interview.status = 'COMPLETED';
    interview.score = score;
    interview.feedback = feedback;
    interview.completedAt = new Date();
    await interview.save();

    res.json({
      message: 'Interview completed successfully',
      interview: interview.toJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// Generate next question based on previous response
router.post(
  '/:id/next-question',
  protect,
  [
    param('id').isMongoId(),
    body('previousResponse').notEmpty().withMessage('Previous response is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { previousResponse } = req.body;

      const interview = await AIInterview.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      // Generate follow-up question based on previous response
      const prompt = `You are an AI interviewer conducting a ${interview.interviewType} interview on ${interview.topic}.

The candidate just answered: "${previousResponse}"

Generate ONE insightful follow-up question that:
1. Digs deeper into their answer
2. Tests their understanding
3. Is relevant to ${interview.topic}
4. Matches ${interview.difficulty} difficulty level

Respond with ONLY a JSON object in this format:
{
  "questionText": "Your follow-up question here",
  "expectedAnswer": "Brief expected answer"
}`;

      let nextQuestion;
      try {
        const aiResponse = await aiService.generateCompletion(prompt, { temperature: 0.8 });
        const parsed = aiService.parseJSONResponse(aiResponse);
        
        if (parsed && parsed.questionText) {
          nextQuestion = {
            questionText: parsed.questionText,
            questionType: 'OPEN_ENDED',
            expectedAnswer: parsed.expectedAnswer || '',
            difficulty: interview.difficulty,
            topic: interview.topic,
            order: interview.questions.length + 1,
            timeAsked: new Date(),
          };
        }
      } catch (aiError) {
        console.error('AI question generation failed:', aiError);
      }

      // Fallback question
      if (!nextQuestion) {
        nextQuestion = {
          questionText: `Can you elaborate more on your experience with ${interview.topic}?`,
          questionType: 'OPEN_ENDED',
          expectedAnswer: 'Detailed explanation expected',
          difficulty: interview.difficulty,
          topic: interview.topic,
          order: interview.questions.length + 1,
          timeAsked: new Date(),
        };
      }

      // Add question to interview
      interview.questions.push(nextQuestion);
      await interview.save();

      res.json({
        message: 'Next question generated',
        question: nextQuestion,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete interview
router.delete('/:id', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const interview = await AIInterview.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get TTS configuration for interview
router.get('/:id/tts-config', protect, param('id').isMongoId(), validate, async (req, res, next) => {
  try {
    const { gender = 'female' } = req.query;

    const interview = await AIInterview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const config = ttsService.getSpeechConfig('', { gender });

    res.json({
      voicePreferences: config.voicePreferences,
      rate: config.rate,
      pitch: config.pitch,
      volume: config.volume,
      language: config.language,
    });
  } catch (error) {
    next(error);
  }
});

// Generate speech text for question
router.post(
  '/:id/generate-speech',
  protect,
  [
    param('id').isMongoId(),
    body('questionText').notEmpty().withMessage('Question text is required'),
    body('context').optional().isObject(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { questionText, context = {} } = req.body;

      const interview = await AIInterview.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      const speechText = ttsService.generateInterviewSpeech(questionText, {
        ...context,
        candidateName: req.user.firstName,
      });

      const chunks = ttsService.breakIntoSpeechChunks(speechText);

      res.json({
        speechText,
        chunks,
        estimatedDuration: chunks.reduce((sum, chunk) => sum + chunk.duration, 0),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

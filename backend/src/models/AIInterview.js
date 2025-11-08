import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['MULTIPLE_CHOICE', 'CODING', 'OPEN_ENDED', 'BEHAVIORAL', 'TECHNICAL'],
    default: 'OPEN_ENDED',
  },
  expectedAnswer: String,
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    required: true,
  },
  topic: String,
  order: Number,
  timeAsked: Date,
});

const responseSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  responseText: String,
  audioUrl: String,
  responseTime: Number, // in seconds
  confidence: Number,
  technicalScore: Number,
  communicationScore: Number,
  aiAnalysis: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const aiInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    interviewType: {
      type: String,
      enum: ['TECHNICAL', 'HR', 'APTITUDE', 'BEHAVIORAL', 'DOMAIN_SPECIFIC', 'CODING', 'SYSTEM_DESIGN'],
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    duration: {
      type: Number,
      required: true,
      min: 15,
      max: 120,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: mongoose.Schema.Types.Mixed,
    questions: [questionSchema],
    responses: [responseSchema],
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Transform output to match frontend types
aiInterviewSchema.methods.toJSON = function () {
  const interview = this.toObject();
  
  return {
    id: interview._id.toString(),
    userId: interview.userId?.toString(),
    interviewType: interview.interviewType,
    topic: interview.topic,
    difficulty: interview.difficulty,
    duration: interview.duration,
    status: interview.status,
    score: interview.score,
    feedback: interview.feedback,
    questions: interview.questions?.map(q => ({
      id: q._id?.toString(),
      questionText: q.questionText,
      questionType: q.questionType,
      expectedAnswer: q.expectedAnswer,
      difficulty: q.difficulty,
      topic: q.topic,
      order: q.order,
      timeAsked: q.timeAsked,
    })),
    responses: interview.responses?.map(r => ({
      id: r._id?.toString(),
      questionId: r.questionId?.toString(),
      responseText: r.responseText,
      audioUrl: r.audioUrl,
      responseTime: r.responseTime,
      confidence: r.confidence,
      technicalScore: r.technicalScore,
      communicationScore: r.communicationScore,
      aiAnalysis: r.aiAnalysis,
      createdAt: r.createdAt,
    })),
    startedAt: interview.startedAt,
    completedAt: interview.completedAt,
    createdAt: interview.createdAt,
  };
};

const AIInterview = mongoose.model('AIInterview', aiInterviewSchema);

export default AIInterview;

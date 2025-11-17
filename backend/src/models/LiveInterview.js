import mongoose from 'mongoose';

const liveInterviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    interviewType: {
      type: String,
      enum: ['TECHNICAL', 'HR', 'APTITUDE', 'BEHAVIORAL', 'DOMAIN_SPECIFIC', 'CODING', 'SYSTEM_DESIGN', 'GENERAL'],
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
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 30,
      max: 180,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    meetingUrl: String,
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: mongoose.Schema.Types.Mixed,
    analytics: mongoose.Schema.Types.Mixed,
    isQuickConnect: {
      type: Boolean,
      default: false,
    },
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Transform output to match frontend types
liveInterviewSchema.methods.toJSON = function () {
  const interview = this.toObject();
  
  const result = {
    id: interview._id.toString(),
    candidateId: interview.candidateId?.toString(),
    interviewerId: interview.interviewerId?.toString() || null,
    interviewType: interview.interviewType,
    topic: interview.topic,
    difficulty: interview.difficulty,
    scheduledAt: interview.scheduledAt,
    duration: interview.duration,
    status: interview.status,
    roomId: interview.roomId,
    meetingUrl: interview.meetingUrl,
    score: interview.score,
    feedback: interview.feedback,
    analytics: interview.analytics,
    isQuickConnect: interview.isQuickConnect,
    startedAt: interview.startedAt,
    completedAt: interview.completedAt,
    createdAt: interview.createdAt,
  };

  // Add populated candidate info if available
  if (interview.candidateId && typeof interview.candidateId === 'object') {
    result.candidate = {
      id: interview.candidateId._id?.toString(),
      firstName: interview.candidateId.firstName,
      lastName: interview.candidateId.lastName,
      email: interview.candidateId.email,
      profileImage: interview.candidateId.profileImage,
    };
  }

  // Add populated interviewer info if available
  if (interview.interviewerId && typeof interview.interviewerId === 'object') {
    result.interviewer = {
      id: interview.interviewerId._id?.toString(),
      firstName: interview.interviewerId.firstName,
      lastName: interview.interviewerId.lastName,
      email: interview.interviewerId.email,
      profileImage: interview.interviewerId.profileImage,
    };
  }

  return result;
};

const LiveInterview = mongoose.model('LiveInterview', liveInterviewSchema);

export default LiveInterview;

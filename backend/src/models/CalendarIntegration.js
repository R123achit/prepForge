import mongoose from 'mongoose';

const calendarIntegrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['google'],
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  tokenExpiry: {
    type: Date
  },
  calendarId: {
    type: String,
    default: 'primary'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    autoSync: {
      type: Boolean,
      default: true
    },
    reminderMinutes: {
      type: Number,
      default: 15
    },
    syncAIInterviews: {
      type: Boolean,
      default: true
    },
    syncLiveInterviews: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
calendarIntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

export default mongoose.model('CalendarIntegration', calendarIntegrationSchema);
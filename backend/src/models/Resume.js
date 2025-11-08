import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    targetCompany: String,
    status: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'UPLOADED',
    },
    // Analysis Results
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    strengths: [String],
    improvements: [String],
    keywords: {
      present: [String],
      missing: [String],
    },
    sections: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    rawText: String,
    aiAnalysis: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Transform output
resumeSchema.methods.toJSON = function () {
  const resume = this.toObject();
  
  return {
    id: resume._id.toString(),
    userId: resume.userId?.toString(),
    fileName: resume.fileName,
    filePath: resume.filePath,
    fileSize: resume.fileSize,
    jobRole: resume.jobRole,
    targetCompany: resume.targetCompany,
    status: resume.status,
    overallScore: resume.overallScore,
    matchPercentage: resume.matchPercentage,
    strengths: resume.strengths,
    improvements: resume.improvements,
    keywords: resume.keywords,
    sections: resume.sections,
    aiAnalysis: resume.aiAnalysis,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
};

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;

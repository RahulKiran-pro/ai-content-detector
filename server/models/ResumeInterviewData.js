const mongoose = require('mongoose');

const resumeInterviewDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['resume', 'interview_session'],
      required: true
    },
    rawContent: {
      type: String,
      default: ''
    },
    extractedFields: {
      type: mongoose.Schema.Types.Mixed
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed
    },
    linkedDetection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DetectionHistory'
    }
  },
  {
    timestamps: true
  }
);

resumeInterviewDataSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeInterviewData', resumeInterviewDataSchema);

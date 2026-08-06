const mongoose = require('mongoose');

const detectionHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    contentType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'pdf'],
      required: true
    },
    inputSummary: {
      type: String,
      default: ''
    },
    truthscanId: {
      type: String,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'analyzing', 'done', 'failed'],
      default: 'pending'
    },
    result: {
      type: mongoose.Schema.Types.Mixed
    },
    verdict: {
      type: String,
      default: 'Unverified'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

// Fast recent history index
detectionHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('DetectionHistory', detectionHistorySchema);

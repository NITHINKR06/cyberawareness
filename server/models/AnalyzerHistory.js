import mongoose from 'mongoose';

const analyzerHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  inputType: {
    type: String,
    required: true,
    enum: ['text', 'url', 'email', 'phone']
  },
  inputContent: {
    type: String,
    required: true
  },
  analysisResult: {
    threatLevel: {
      type: String,
      enum: ['safe', 'suspicious', 'dangerous'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    indicators: [{
      type: String
    }],
    recommendations: [{
      type: String
    }],
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
analyzerHistorySchema.index({ userId: 1, createdAt: -1 });
analyzerHistorySchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model('AnalyzerHistory', analyzerHistorySchema);

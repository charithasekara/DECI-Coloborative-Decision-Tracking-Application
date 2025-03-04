const mongoose = require('mongoose');

// Define the decision schema
const decisionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['personal', 'professional', 'financial', 'health', 'relationships', 'career', 'education']
  },
  deadline: {
    type: Date
  },
  impactScore: {
    type: Number,
    required: [true, ' is required'],
    min: [1, 'Impact score must be at least 1'],
    max: [10, 'Impact score cannot exceed 10']
  },
  urgencyLevel: {
    type: Number,
    required: [true, 'Urgency level is required'],
    min: [1, 'Urgency level must be at least 1'],
    max: [5, 'Urgency level cannot exceed 5']
  },
  confidenceLevel: {
    type: Number,
    required: [true, 'Confidence level is required'],
    min: [1, 'Confidence level must be at least 1'],
    max: [10, 'Confidence level cannot exceed 10']
  },
  currentMood: {
    type: Number,
    required: [true, 'Current mood is required'],
    min: [1, 'Current mood must be at least 1'],
    max: [5, 'Current mood cannot exceed 5']
  },
  affectedAreas: [{
    type: String
  }],
  stakeholders: {
    keyStakeholders: {
      type: String,
      required: [true, 'Key stakeholders are required']
    },
    impactAnalysis: {
      type: String,
      required: [true, 'Impact analysis is required']
    },
    communicationPlan: {
      type: String,
      required: [true, 'Communication plan is required']
    }
  },
  outcomes: {
    expected: {
      type: String,
      required: [true, 'Expected outcomes are required']
    },
    successMetrics: {
      type: String,
      required: [true, 'Success metrics are required']
    },
    potentialRisks: {
      type: String,
      required: [true, 'Potential risks are required']
    },
    riskMitigation: {
      type: String,
      required: [true, 'Risk mitigation strategies are required']
    }
  },
  approvalRequired: {
    type: Boolean,
    default: false
  },
  backupPlan: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the `updatedAt` field whenever a document is updated
decisionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export the Decision model
module.exports = mongoose.model('Decision', decisionSchema);

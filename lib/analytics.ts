const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description must be at least 1 character long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'personal',
          'professional',
          'financial',
          'health',
          'relationships',
          'career',
          'education',
        ],
        message: 'Invalid category',
      },
      default: 'personal',
    },
    rationale: {
      type: String,
      required: [true, 'Rationale is required'],
      trim: true,
      minlength: [1, 'Rationale must be at least 1 character long'],
      maxlength: [1000, 'Rationale cannot exceed 1000 characters'],
    },
    impactScore: {
      type: Number,
      required: [true, 'Impact Score is required'],
      min: [1, 'Impact Score must be at least 1'],
      max: [10, 'Impact Score cannot exceed 10'],
    },
    urgencyLevel: {
      type: Number,
      required: [true, 'Urgency Level is required'],
      min: [1, 'Urgency Level must be at least 1'],
      max: [5, 'Urgency Level cannot exceed 5'],
    },
    confidenceLevel: {
      type: Number,
      required: [true, 'Confidence Level is required'],
      min: [1, 'Confidence Level must be at least 1'],
      max: [10, 'Confidence Level cannot exceed 10'],
    },
    currentMood: {
      type: Number,
      required: [true, 'Current Mood is required'],
      min: [1, 'Current Mood must be at least 1'],
      max: [5, 'Current Mood cannot exceed 5'],
    },
    affectedAreas: {
      type: [String],
      required: [true, 'At least one affected area is required'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one affected area is required',
      },
      enum: {
        values: ['financial', 'productivity', 'wellbeing', 'relationships', 'career', 'security'],
        message: 'Invalid affected area',
      },
    },
    stakeholders: {
      keyStakeholders: {
        type: String,
        required: [true, 'Key Stakeholders are required'],
        trim: true,
        minlength: [1, 'Key Stakeholders must be at least 1 character long'],
        maxlength: [500, 'Key Stakeholders cannot exceed 500 characters'],
      },
      impactAnalysis: {
        type: String,
        required: [true, 'Impact Analysis is required'],
        trim: true,
        minlength: [1, 'Impact Analysis must be at least 1 character long'],
        maxlength: [1000, 'Impact Analysis cannot exceed 1000 characters'],
      },
      communicationPlan: {
        type: String,
        required: [true, 'Communication Plan is required'],
        trim: true,
        minlength: [1, 'Communication Plan must be at least 1 character long'],
        maxlength: [1000, 'Communication Plan cannot exceed 1000 characters'],
      },
    },
    outcomes: {
      expected: {
        type: String,
        required: [true, 'Expected Outcome is required'],
        trim: true,
        minlength: [1, 'Expected Outcome must be at least 1 character long'],
        maxlength: [1000, 'Expected Outcome cannot exceed 1000 characters'],
      },
      actual: {
        type: String,
        trim: true,
        maxlength: [1000, 'Actual Outcome cannot exceed 1000 characters'],
        default: '',
      },
      successMetrics: {
        type: String,
        required: [true, 'Success Metrics are required'],
        trim: true,
        minlength: [1, 'Success Metrics must be at least 1 character long'],
        maxlength: [1000, 'Success Metrics cannot exceed 1000 characters'],
      },
      potentialRisks: {
        type: String,
        required: [true, 'Potential Risks are required'],
        trim: true,
        minlength: [1, 'Potential Risks must be at least 1 character long'],
        maxlength: [1000, 'Potential Risks cannot exceed 1000 characters'],
      },
      riskMitigation: {
        type: String,
        required: [true, 'Risk Mitigation is required'],
        trim: true,
        minlength: [1, 'Risk Mitigation must be at least 1 character long'],
        maxlength: [1000, 'Risk Mitigation cannot exceed 1000 characters'],
      },
    },
    deadline: {
      type: Date,
      required: false,
    },
    approvalRequired: {
      type: Boolean,
      default: false,
    },
    backupPlan: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'completed', 'archived'],
        message: 'Invalid status',
      },
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Sanitize inputs before saving
decisionSchema.pre('save', function (next) {
  const sanitizeString = (str) => (typeof str === 'string' ? str.trim() : str);

  this.title = sanitizeString(this.title);
  this.description = sanitizeString(this.description);
  this.rationale = sanitizeString(this.rationale);
  this.stakeholders.keyStakeholders = sanitizeString(this.stakeholders.keyStakeholders);
  this.stakeholders.impactAnalysis = sanitizeString(this.stakeholders.impactAnalysis);
  this.stakeholders.communicationPlan = sanitizeString(this.stakeholders.communicationPlan);
  this.outcomes.expected = sanitizeString(this.outcomes.expected);
  this.outcomes.actual = sanitizeString(this.outcomes.actual);
  this.outcomes.successMetrics = sanitizeString(this.outcomes.successMetrics);
  this.outcomes.potentialRisks = sanitizeString(this.outcomes.potentialRisks);
  this.outcomes.riskMitigation = sanitizeString(this.outcomes.riskMitigation);

  next();
});

module.exports = mongoose.model('Decision', decisionSchema);
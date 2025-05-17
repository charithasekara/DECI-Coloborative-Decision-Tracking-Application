const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  team: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
  },
  decisions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Decision',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
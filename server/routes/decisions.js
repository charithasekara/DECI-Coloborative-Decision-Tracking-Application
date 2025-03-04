const express = require('express');
const router = express.Router();
const Decision = require('../models/Decision');

// Middleware to validate numeric fields before creating or updating a decision
const validateNumericFields = (req, res, next) => {
  const { impactScore, urgencyLevel, confidenceLevel, currentMood } = req.body;

  try {
    req.body.impactScore = Number(impactScore);
    req.body.urgencyLevel = Number(urgencyLevel);
    req.body.confidenceLevel = Number(confidenceLevel);
    req.body.currentMood = Number(currentMood);

    if (isNaN(req.body.impactScore) || isNaN(req.body.urgencyLevel) || isNaN(req.body.confidenceLevel) || isNaN(req.body.currentMood)) {
      return res.status(400).json({ message: 'Invalid numeric values in request body' });
    }
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Error parsing numeric values', error: err.message });
  }
};

// Get all decisions
router.get('/', async (req, res) => {
  try {
    const decisions = await Decision.find().sort({ createdAt: -1 });
    res.status(200).json(decisions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving decisions', error: err.message });
  }
});

// Get a single decision by ID
router.get('/:id', async (req, res) => {
  try {
    const decision = await Decision.findById(req.params.id);
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }
    res.status(200).json(decision);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving decision', error: err.message });
  }
});

// Create a new decision
router.post('/', validateNumericFields, async (req, res) => {
  try {
    const newDecision = new Decision(req.body);
    await newDecision.save();
    res.status(201).json({ message: 'Decision created successfully', decision: newDecision });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error creating decision', error: err.message });
  }
});

// Update a decision by ID
router.patch('/:id', validateNumericFields, async (req, res) => {
  try {
    const decision = await Decision.findById(req.params.id);
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }

    Object.assign(decision, req.body);
    await decision.save();
    res.status(200).json({ message: 'Decision updated successfully', decision });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error updating decision', error: err.message });
  }
});

// Delete a decision by ID
router.delete('/:id', async (req, res) => {
  try {
    const decision = await Decision.findById(req.params.id);
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }
    await decision.deleteOne();
    res.status(200).json({ message: 'Decision deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting decision', error: err.message });
  }
});

module.exports = router;
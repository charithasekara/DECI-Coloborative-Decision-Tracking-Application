const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.status(200).json({ goals });
  } catch (error) {
    console.error('GET /api/goals - Error:', error.message);
    res.status(500).json({ message: 'Error retrieving goals', errors: [error.message] });
  }
});

router.post('/', async (req, res) => {
  try {
    const goal = new Goal(req.body);
    const savedGoal = await goal.save();
    res.status(201).json({ goal: savedGoal });
  } catch (error) {
    console.error('POST /api/goals - Error:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Error creating goal', errors: [error.message] });
  }
});

module.exports = router;
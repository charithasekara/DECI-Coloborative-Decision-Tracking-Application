const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    console.error('GET /api/projects - Error:', error.message);
    res.status(500).json({ message: 'Error retrieving projects', errors: [error.message] });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json({ project: savedProject });
  } catch (error) {
    console.error('POST /api/projects - Error:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Error creating project', errors: [error.message] });
  }
});

module.exports = router;
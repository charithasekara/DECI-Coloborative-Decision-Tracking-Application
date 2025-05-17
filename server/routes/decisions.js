const express = require('express');
const router = express.Router();
const Decision = require('../models/Decision');
const mongoose = require('mongoose');

// Middleware to log raw request body for debugging
router.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

router.post('/', async (req, res) => {
  try {
    console.log('Raw request body:', req.rawBody);
    console.log('Parsed request body:', req.body);

    let normalizedAffectedAreas = [];
    if (Array.isArray(req.body.affectedAreas)) {
      if (req.body.affectedAreas.length > 0 && typeof req.body.affectedAreas[0] === 'object') {
        normalizedAffectedAreas = [Object.values(req.body.affectedAreas[0]).join('')];
      } else {
        normalizedAffectedAreas = req.body.affectedAreas;
      }
    } else if (typeof req.body.affectedAreas === 'string') {
      normalizedAffectedAreas = [req.body.affectedAreas];
    }

    const decisionData = {
      ...req.body,
      affectedAreas: normalizedAffectedAreas,
      stakeholders: req.body.stakeholders || {},
      outcomes: req.body.outcomes || {},
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
    };

    console.log('Normalized decision data:', decisionData);

    const decision = new Decision(decisionData);
    await decision.save();

    res.status(201).json({ decision: { ...decision.toObject(), id: decision._id } });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      console.error('Validation Error:', errors);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    console.error('Error creating decision:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// Get all decisions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const decisions = await Decision.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Decision.countDocuments(query);
    const pages = Math.ceil(total / Number(limit));

    res.json({
      decisions: decisions.map((d) => ({ ...d, id: d._id })),
      total,
      pages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// Get decision by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.error('Invalid decision ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid decision ID' });
    }

    const decision = await Decision.findById(req.params.id).lean();
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }

    res.json({ decision: { ...decision, id: decision._id } });
  } catch (error) {
    console.error('Error fetching decision:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// Update a decision
router.patch('/:id', async (req, res) => {
  try {
    console.log(`Raw request body for update ${req.params.id}:`, req.rawBody);
    console.log(`Parsed request body for update ${req.params.id}:`, req.body);

    let normalizedAffectedAreas = req.body.affectedAreas;
    if (Array.isArray(req.body.affectedAreas)) {
      if (req.body.affectedAreas.length > 0 && typeof req.body.affectedAreas[0] === 'object') {
        normalizedAffectedAreas = [Object.values(req.body.affectedAreas[0]).join('')];
      } else {
        normalizedAffectedAreas = req.body.affectedAreas.filter((area) => typeof area === 'string' && area.trim().length > 0);
      }
    } else if (typeof req.body.affectedAreas === 'string') {
      normalizedAffectedAreas = [req.body.affectedAreas.trim()];
    } else if (!req.body.affectedAreas) {
      const existingDecision = await Decision.findById(req.params.id).lean();
      normalizedAffectedAreas = existingDecision?.affectedAreas || [];
    }

    const decisionData = {
      ...req.body,
      affectedAreas: normalizedAffectedAreas,
      stakeholders: req.body.stakeholders || undefined,
      outcomes: req.body.outcomes || undefined,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
    };

    console.log(`Normalized update data for id ${req.params.id}:`, decisionData);

    const decision = await Decision.findByIdAndUpdate(req.params.id, decisionData, {
      new: true,
      runValidators: true,
      context: 'query',
    }).lean();

    if (!decision) {
      return res.status(404).json({ message: 'Decision not found' });
    }

    res.json({ decision: { ...decision, id: decision._id } });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      console.error(`Validation Error for update ${req.params.id}:`, errors);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    console.error(`Error updating decision ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// Delete a decision
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Received delete request for id: ${req.params.id}`); // Log the incoming request
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.error('Invalid decision ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid decision ID' });
    }

    const decision = await Decision.findByIdAndDelete(req.params.id).lean();
    if (!decision) {
      console.log(`Decision not found for id: ${req.params.id}`); // Log if not found
      return res.status(404).json({ message: 'Decision not found' });
    }

    console.log(`Successfully deleted decision with id: ${req.params.id}`); // Log success
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting decision with id ${req.params.id}:`, error);
    if (error.name === 'MongoError' || error.name === 'CastError') {
      return res.status(500).json({ message: 'Database error occurred', details: error.message });
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;
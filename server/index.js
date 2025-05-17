const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const decisionRoutes = require('./routes/decisions');
const goalRoutes = require('./routes/goals');
const projectRoutes = require('./routes/projects');
const aiRoutes = require('./routes/ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/decision-making-app';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// MongoDB Connection
mongoose
  .connect(MONGODB_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error.message);
});

// Routes
app.use('/api/decisions', decisionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);

// Enhanced Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  } else if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(500).json({ message: 'Database error', errors: [err.message] });
  }
  res.status(500).json({ message: 'Internal server error', errors: [err.message] });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
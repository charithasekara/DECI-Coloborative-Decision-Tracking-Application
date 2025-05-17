const express = require('express');
const axios = require('axios');
const router = express.Router();
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

router.post('/insights', async (req, res) => {
  try {
    const { description, outcomes } = req.body;
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      { inputs: outcomes.expected || description },
      { headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` } }
    );
    const sentiment = response.data[0][0].label === 'POSITIVE' ? 'Positive' : 'Negative';
    const insights = [
      `Sentiment Analysis: ${sentiment}`,
      `Success Probability: ${Math.round(Math.random() * 100)}% (Placeholder)`,
    ];
    res.json({ insights });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

module.exports = router;
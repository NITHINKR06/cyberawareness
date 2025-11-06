import express from 'express';
import Scam from '../models/Scam.js'; // Use the Mongoose model
const router = express.Router();

// Prototype Endpoint: /api/scenarios/era/:year
router.get('/era/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    let era;

    if (year <= 2017) {
        era = 'Classics';
    } else if (year <= 2025) {
        era = 'Threats';
    } else {
        // For 2035, since we don't have data, return the latest threats
        era = 'Threats'; 
    }

    const scenarios = await Scam.find({ era: era }).sort({ year: 'asc' });

    if (scenarios.length === 0) {
      return res.status(404).json({ message: `No scenarios found for the ${era} era.` });
    }

    res.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ error: 'Server error while fetching scenarios' });
  }
});

export default router;
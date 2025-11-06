import express from 'express';
import { getValidationRules, updateValidationRules } from '../config/validationRules.js';

const router = express.Router();

// Get current validation configuration
router.get('/validation-rules', (req, res) => {
  try {
    const rules = getValidationRules();
    res.json({
      success: true,
      rules
    });
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch validation rules'
    });
  }
});

// Update validation rules (admin only - add authentication middleware in production)
router.put('/validation-rules', (req, res) => {
  try {
    // In production, add authentication check here
    // if (!req.user || !req.user.isAdmin) {
    //   return res.status(403).json({ success: false, error: 'Unauthorized' });
    // }
    
    const newRules = req.body;
    const updatedRules = updateValidationRules(newRules);
    
    res.json({
      success: true,
      message: 'Validation rules updated successfully',
      rules: updatedRules
    });
  } catch (error) {
    console.error('Error updating validation rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update validation rules'
    });
  }
});

// Get threat level configuration only
router.get('/threat-levels', (req, res) => {
  try {
    const rules = getValidationRules();
    res.json({
      success: true,
      threatLevels: rules.threatLevels
    });
  } catch (error) {
    console.error('Error fetching threat levels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch threat levels'
    });
  }
});

// Get keywords configuration
router.get('/scam-keywords', (req, res) => {
  try {
    const rules = getValidationRules();
    res.json({
      success: true,
      keywords: rules.scamKeywords,
      weights: rules.keywordWeights
    });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch keywords'
    });
  }
});

// Update specific keyword category
router.put('/scam-keywords/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { keywords } = req.body;
    
    const rules = getValidationRules();
    
    if (!rules.scamKeywords[category]) {
      return res.status(400).json({
        success: false,
        error: `Invalid keyword category: ${category}`
      });
    }
    
    rules.scamKeywords[category] = keywords;
    updateValidationRules(rules);
    
    res.json({
      success: true,
      message: `Keywords for category '${category}' updated successfully`,
      keywords: rules.scamKeywords[category]
    });
  } catch (error) {
    console.error('Error updating keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update keywords'
    });
  }
});

export default router;

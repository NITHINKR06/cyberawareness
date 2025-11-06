import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for file uploads
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


// OCR Upload endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    console.log('Starting OCR processing for:', {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });

    // Perform OCR using Tesseract.js
    const { data: { text, confidence } } = await Tesseract.recognize(
      req.file.path,
      'eng', // Language: English
      {
        logger: m => console.log('OCR Progress:', m)
      }
    );

    const ocrResult = {
      success: true,
      text: text.trim(),
      confidence: confidence / 100, // Convert to 0-1 scale
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      processingTime: new Date().toISOString()
    };

    console.log('OCR processing completed:', {
      filename: req.file.filename,
      textLength: text.length,
      confidence: confidence
    });

    res.json(ocrResult);

  } catch (error) {
    console.error('OCR upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process image upload',
      details: error.message 
    });
  }
});

router.post('/ocr', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        const ocrResult = await aiAnalyzer.processImageWithOCR(req.file.buffer);
        res.json(ocrResult);
    } catch (error) {
        console.error('OCR processing error:', error);
        res.status(500).json({ error: 'Failed to process the image.' });
    }
});

// Get OCR result endpoint (for future use)
router.get('/result/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // In a real implementation, you would retrieve the OCR result from database
    res.json({
      success: true,
      message: 'OCR result retrieved',
      filename: filename
    });
  } catch (error) {
    console.error('Get OCR result error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve OCR result' 
    });
  }
});

export default router;

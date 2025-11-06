import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import ScamReport from '../models/ScamReport.js';
import User from '../models/User.js';
import { authenticateToken } from './auth.js';
import { generateComplaintPDFBuffer } from '../services/pdfGenerator.js';

const router = express.Router();

// Submit a scam report (public endpoint - no auth required)
router.post('/', async (req, res) => {
  try {
    console.log('Report submission request received:', req.body);
    const {
      scamType,
      description,
      websiteUrl,
      phoneNumber,
      emailAddress,
      severity,
      // Enhanced complaint fields
      fullName,
      mobile,
      gender,
      dob,
      spouse,
      relationWithVictim,
      personalEmail,
      houseNo,
      streetName,
      colony,
      village,
      tehsil,
      district,
      state,
      country,
      policeStation,
      pincode
    } = req.body;

    // Validate required fields
    if (!scamType || !description || !severity) {
      return res.status(400).json({ 
        error: 'Scam type, description, and severity are required' 
      });
    }

    // Validate enhanced fields for official complaint
    if (fullName && (!mobile || !gender || !streetName || !village || !tehsil || !district || !state || !policeStation || !pincode)) {
      return res.status(400).json({ 
        error: 'For official complaint, mobile, gender, street name, village, tehsil, district, state, police station, and pincode are required' 
      });
    }

    // Get user ID from token if authenticated
    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        // Token invalid or expired, continue as anonymous
        console.log('Invalid token, proceeding as anonymous');
      }
    }

    // Generate PDF if official complaint data is provided
    let pdfData = null;
    let complaintNumber = null;
    
    if (fullName) {
      try {
        const complaintData = {
          scamType,
          description,
          websiteUrl: websiteUrl || '',
          phoneNumber: phoneNumber || '',
          emailAddress: emailAddress || '',
          fullName,
          mobile,
          gender,
          dob: dob ? new Date(dob) : null,
          spouse: spouse || '',
          relationWithVictim: relationWithVictim || '',
          personalEmail: personalEmail || '',
          houseNo: houseNo || '',
          streetName,
          colony: colony || '',
          village,
          tehsil,
          district,
          state,
          country: country || 'India',
          policeStation,
          pincode
        };
        
        const pdfResult = generateComplaintPDFBuffer(complaintData);
        pdfData = {
          md5Hash: pdfResult.md5Hash,
          sha256Hash: pdfResult.sha256Hash
        };
        complaintNumber = pdfResult.complaintNumber;
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        // Continue without PDF if generation fails
      }
    }

    // Ensure session ID exists
    if (!req.session.sessionId) {
      req.session.sessionId = uuidv4();
    }

    // Create report
    const report = new ScamReport({
      userId,
      sessionId: req.session.sessionId,
      scamType,
      description,
      websiteUrl: websiteUrl || '',
      phoneNumber: phoneNumber || '',
      emailAddress: emailAddress || '',
      severity,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      // Enhanced fields
      complaintNumber,
      fullName: fullName || '',
      mobile: mobile || '',
      gender: gender || '',
      dob: dob ? new Date(dob) : null,
      spouse: spouse || '',
      relationWithVictim: relationWithVictim || '',
      personalEmail: personalEmail || '',
      houseNo: houseNo || '',
      streetName: streetName || '',
      colony: colony || '',
      village: village || '',
      tehsil: tehsil || '',
      district: district || '',
      state: state || '',
      country: country || 'India',
      policeStation: policeStation || '',
      pincode: pincode || '',
      pdfData
    });

    await report.save();

    // Award points if user is authenticated
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          $inc: { totalPoints: fullName ? 50 : 25 } // More points for official complaint
        });
      } catch (userError) {
        console.error('User points update error:', userError);
        // Continue even if points update fails
      }
    }

    res.status(201).json({
      message: 'Scam report submitted successfully',
      reportId: report._id,
      complaintNumber,
      pointsAwarded: userId ? (fullName ? 50 : 25) : 0,
      isOfficialComplaint: !!fullName
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error while submitting report' });
  }
});

// Get all reports (admin endpoint - would need admin auth in production)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const reports = await ScamReport.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Server error while fetching reports' });
  }
});

// Get user's reports (authenticated)
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const reports = await ScamReport.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ error: 'Server error while fetching reports' });
  }
});

// Get reports by session (for anonymous users to see their history)
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (sessionId !== req.session.sessionId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reports = await ScamReport.find({ sessionId })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching session reports:', error);
    res.status(500).json({ error: 'Server error while fetching reports' });
  }
});

// Get recent reports (public - for dashboard)
router.get('/recent', async (req, res) => {
  try {
    const reports = await ScamReport.find({ status: 'verified' })
      .select('scamType severity createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    res.status(500).json({ error: 'Server error while fetching reports' });
  }
});

// Get report statistics (public)
router.get('/stats', async (req, res) => {
  try {
    const totalReports = await ScamReport.countDocuments();
    const last24Hours = await ScamReport.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const last7Days = await ScamReport.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const typeDistribution = await ScamReport.aggregate([
      {
        $group: {
          _id: '$scamType',
          count: { $sum: 1 }
        }
      }
    ]);

    const severityDistribution = await ScamReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalReports,
      last24Hours,
      last7Days,
      typeDistribution,
      severityDistribution
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'Server error while fetching statistics' });
  }
});

// Download PDF for a specific report
router.get('/pdf/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await ScamReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if user has access to this report
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let hasAccess = false;
    
    if (token) {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        hasAccess = report.userId && report.userId.toString() === decoded.userId;
      } catch (err) {
        // Token invalid
      }
    }
    
    // Also allow access if it's the same session
    hasAccess = hasAccess || report.sessionId === req.session.sessionId;
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!report.fullName) {
      return res.status(400).json({ error: 'No official complaint PDF available for this report' });
    }

    // Generate PDF data
    const complaintData = {
      scamType: report.scamType,
      description: report.description,
      websiteUrl: report.websiteUrl,
      phoneNumber: report.phoneNumber,
      emailAddress: report.emailAddress,
      fullName: report.fullName,
      mobile: report.mobile,
      gender: report.gender,
      dob: report.dob,
      spouse: report.spouse,
      relationWithVictim: report.relationWithVictim,
      personalEmail: report.personalEmail,
      houseNo: report.houseNo,
      streetName: report.streetName,
      colony: report.colony,
      village: report.village,
      tehsil: report.tehsil,
      district: report.district,
      state: report.state,
      country: report.country,
      policeStation: report.policeStation,
      pincode: report.pincode
    };
    
    const pdfResult = generateComplaintPDFBuffer(complaintData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="complaint_${report.complaintNumber}.pdf"`);
    res.send(pdfResult.buffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Server error while generating PDF' });
  }
});

export default router;

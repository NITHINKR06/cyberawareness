import express from 'express';
import User from '../models/User.js';
import ScamReport from '../models/ScamReport.js';
import AnalyzerHistory from '../models/AnalyzerHistory.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Get user's complete history (reports + analyzer)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all session IDs associated with this user
    const sessionIds = user.linkedSessions || [];
    
    // Fetch reports (both by userId and linked sessions)
    const reports = await ScamReport.find({
      $or: [
        { userId: req.userId },
        { sessionId: { $in: sessionIds } }
      ]
    }).sort({ createdAt: -1 });

    // Fetch analyzer history (both by userId and linked sessions)
    const analyzerHistory = await AnalyzerHistory.find({
      $or: [
        { userId: req.userId },
        { sessionId: { $in: sessionIds } }
      ]
    }).sort({ createdAt: -1 });

    // Combine and sort by date
    const combinedHistory = [
      ...reports.map(r => ({
        type: 'report',
        data: r,
        createdAt: r.createdAt
      })),
      ...analyzerHistory.map(a => ({
        type: 'analysis',
        data: a,
        createdAt: a.createdAt
      }))
    ].sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      reports: reports.length,
      analyses: analyzerHistory.length,
      totalActivities: combinedHistory.length,
      history: combinedHistory.slice(0, 50) // Return latest 50 items
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Server error while fetching history' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sessionIds = user.linkedSessions || [];

    // Count reports
    const totalReports = await ScamReport.countDocuments({
      $or: [
        { userId: req.userId },
        { sessionId: { $in: sessionIds } }
      ]
    });

    // Count verified reports
    const verifiedReports = await ScamReport.countDocuments({
      $or: [
        { userId: req.userId },
        { sessionId: { $in: sessionIds } }
      ],
      status: 'verified'
    });

    // Count analyses
    const totalAnalyses = await AnalyzerHistory.countDocuments({
      $or: [
        { userId: req.userId },
        { sessionId: { $in: sessionIds } }
      ]
    });

    // Count dangerous findings
    const dangerousFindings = await AnalyzerHistory.countDocuments({
      $or: [
        { userId: req.userId },
        { sessionId: { $in: sessionIds } }
      ],
      'analysisResult.threatLevel': 'dangerous'
    });

    // Get report distribution by type
    const reportTypes = await ScamReport.aggregate([
      {
        $match: {
          $or: [
            { userId: req.userId },
            { sessionId: { $in: sessionIds } }
          ]
        }
      },
      {
        $group: {
          _id: '$scamType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      user: {
        username: user.username,
        level: user.level,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        memberSince: user.createdAt
      },
      activity: {
        totalReports,
        verifiedReports,
        totalAnalyses,
        dangerousFindings,
        reportTypes
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error while fetching statistics' });
  }
});

// Update user points (for gamification)
router.post('/points', authenticateToken, async (req, res) => {
  try {
    const { points, reason } = req.body;

    if (!points || !reason) {
      return res.status(400).json({ error: 'Points and reason are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.totalPoints += points;
    
    // Update level based on points
    const newLevel = Math.floor(user.totalPoints / 500) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    await user.save();

    res.json({
      message: 'Points updated successfully',
      totalPoints: user.totalPoints,
      level: user.level,
      pointsAdded: points,
      reason
    });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ error: 'Server error while updating points' });
  }
});

// Complete learning module
router.post('/modules/complete', authenticateToken, async (req, res) => {
  try {
    const { moduleId, score, totalQuestions } = req.body;

    if (!moduleId || score === undefined) {
      return res.status(400).json({ error: 'Module ID and score are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate points based on performance (score out of total questions)
    const performanceRatio = totalQuestions > 0 ? score / totalQuestions : 0;
    const basePoints = 50; // Base points for completing a module
    const bonusPoints = Math.floor(basePoints * performanceRatio);
    const totalPointsEarned = basePoints + bonusPoints;

    // Update user points
    user.totalPoints += totalPointsEarned;
    
    // Update level based on points
    const newLevel = Math.floor(user.totalPoints / 500) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    // Track completed modules (store in completedModules array)
    if (!user.completedModules) {
      user.completedModules = [];
    }
    if (!user.completedModules.includes(moduleId)) {
      user.completedModules.push(moduleId);
    }

    await user.save();

    res.json({
      message: 'Module completed successfully',
      totalPoints: user.totalPoints,
      level: user.level,
      pointsEarned: totalPointsEarned,
      moduleId,
      completedModules: user.completedModules
    });
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({ error: 'Server error while completing module' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    // Get top users by total points
    const topUsers = await User.find({
      isActive: true,
      isBanned: false
    })
      .select('username totalPoints level currentStreak')
      .sort({ totalPoints: -1, level: -1 })
      .limit(limit);

    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      userId: user._id.toString(),
      username: user.username,
      totalPoints: user.totalPoints,
      level: user.level,
      currentStreak: user.currentStreak,
      rank: index + 1
    }));

    res.json({
      leaderboard,
      totalUsers: await User.countDocuments({ isActive: true, isBanned: false })
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error while fetching leaderboard' });
  }
});

export default router;

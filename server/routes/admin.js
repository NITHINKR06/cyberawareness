import express from 'express';
import { verifyFirebaseAdmin, verifyFirebaseModerator, verifyFirebaseSuperAdmin } from '../middleware/firebaseAdminAuth.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Topic from '../models/Topic.js';
import Scam from '../models/Scam.js';
import ScamReport from '../models/ScamReport.js';
import AnalyzerHistory from '../models/AnalyzerHistory.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// ============= DASHBOARD STATS =============
router.get('/stats', verifyFirebaseAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalPosts,
      totalComments,
      totalTopics,
      totalScams,
      totalReports,
      pendingReports,
      totalAnalyses
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments(),
      Comment.countDocuments(),
      Topic.countDocuments(),
      Scam.countDocuments(),
      ScamReport.countDocuments(),
      ScamReport.countDocuments({ status: 'pending' }),
      AnalyzerHistory.countDocuments()
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt role');

    const recentReports = await ScamReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username email');

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'username')
      .populate('topic', 'name');

    // Get analytics data for charts
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const dailyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalPosts,
        totalComments,
        totalTopics,
        totalScams,
        totalReports,
        pendingReports,
        totalAnalyses
      },
      recentActivity: {
        users: recentUsers,
        reports: recentReports,
        posts: recentPosts
      },
      analytics: {
        dailyUserRegistrations: dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============= USER MANAGEMENT =============
router.get('/users', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isBanned = true;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent modifying super admin unless you are super admin
    const targetUser = await User.findById(id);
    if (targetUser.role === 'superadmin' && !req.isSuperAdmin) {
      return res.status(403).json({ error: 'Cannot modify super admin' });
    }

    // If changing password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, lastActivity: Date.now() },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', verifyFirebaseSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting super admin
    const targetUser = await User.findById(id);
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Ban/Unban user
router.post('/users/:id/ban', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isBanned: true, 
        banReason: reason,
        isActive: false 
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

router.post('/users/:id/unban', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isBanned: false, 
        banReason: null,
        isActive: true 
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// ============= POST MANAGEMENT =============
router.get('/posts', verifyFirebaseModerator, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      topic = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (topic) query.topic = topic;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const posts = await Post.find(query)
      .populate('author', 'username email')
      .populate('topic', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.put('/posts/:id', verifyFirebaseModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await Post.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'username email')
     .populate('topic', 'name');

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/posts/:id', verifyFirebaseModerator, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete associated comments
    await Comment.deleteMany({ post: id });
    
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post and associated comments deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ============= COMMENT MANAGEMENT =============
router.get('/comments', verifyFirebaseModerator, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      postId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    
    if (status) query.status = status;
    if (postId) query.post = postId;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const comments = await Comment.find(query)
      .populate('author', 'username email')
      .populate('post', 'title')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.put('/comments/:id', verifyFirebaseModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const comment = await Comment.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('author', 'username email')
     .populate('post', 'title');

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

router.delete('/comments/:id', verifyFirebaseModerator, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete replies to this comment
    await Comment.deleteMany({ parentComment: id });
    
    await Comment.findByIdAndDelete(id);
    res.json({ message: 'Comment and replies deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============= TOPIC MANAGEMENT =============
router.get('/topics', verifyFirebaseAdmin, async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

router.post('/topics', verifyFirebaseAdmin, async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

router.put('/topics/:id', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByIdAndUpdate(id, req.body, { new: true });
    res.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

router.delete('/topics/:id', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if topic has posts
    const postCount = await Post.countDocuments({ topic: id });
    if (postCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete topic with ${postCount} posts. Please reassign or delete posts first.` 
      });
    }
    
    await Topic.findByIdAndDelete(id);
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// ============= SCAM MANAGEMENT =============
router.get('/scams', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      era = '',
      sortBy = 'year',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (era) query.era = era;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const scams = await Scam.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Scam.countDocuments(query);

    res.json({
      scams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching scams:', error);
    res.status(500).json({ error: 'Failed to fetch scams' });
  }
});

router.post('/scams', verifyFirebaseAdmin, async (req, res) => {
  try {
    const scam = new Scam(req.body);
    await scam.save();
    res.json(scam);
  } catch (error) {
    console.error('Error creating scam:', error);
    res.status(500).json({ error: 'Failed to create scam' });
  }
});

router.put('/scams/:id', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const scam = await Scam.findByIdAndUpdate(id, req.body, { new: true });
    res.json(scam);
  } catch (error) {
    console.error('Error updating scam:', error);
    res.status(500).json({ error: 'Failed to update scam' });
  }
});

router.delete('/scams/:id', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Scam.findByIdAndDelete(id);
    res.json({ message: 'Scam deleted successfully' });
  } catch (error) {
    console.error('Error deleting scam:', error);
    res.status(500).json({ error: 'Failed to delete scam' });
  }
});

// ============= SCAM REPORTS MANAGEMENT =============
router.get('/reports', verifyFirebaseModerator, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      severity = '',
      scamType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { complaintNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (scamType) query.scamType = scamType;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reports = await ScamReport.find(query)
      .populate('userId', 'username email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ScamReport.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.put('/reports/:id', verifyFirebaseModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ScamReport.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'username email');

    res.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

router.delete('/reports/:id', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await ScamReport.findByIdAndDelete(id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// ============= ANALYZER HISTORY MANAGEMENT =============
router.get('/analyzer-history', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      userId = '',
      inputType = '',
      threatLevel = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (userId) query.userId = userId;
    if (inputType) query.inputType = inputType;
    if (threatLevel) query['analysisResult.threatLevel'] = threatLevel;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const history = await AnalyzerHistory.find(query)
      .populate('userId', 'username email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AnalyzerHistory.countDocuments(query);

    res.json({
      history,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching analyzer history:', error);
    res.status(500).json({ error: 'Failed to fetch analyzer history' });
  }
});

router.delete('/analyzer-history/:id', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await AnalyzerHistory.findByIdAndDelete(id);
    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

// ============= BULK OPERATIONS =============
router.post('/bulk/users/delete', verifyFirebaseSuperAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    // Prevent deleting super admins
    const superAdmins = await User.find({ 
      _id: { $in: userIds }, 
      role: 'superadmin' 
    });
    
    if (superAdmins.length > 0) {
      return res.status(403).json({ error: 'Cannot delete super admin accounts' });
    }
    
    const result = await User.deleteMany({ _id: { $in: userIds } });
    res.json({ message: `Deleted ${result.deletedCount} users` });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

router.post('/bulk/posts/delete', verifyFirebaseModerator, async (req, res) => {
  try {
    const { postIds } = req.body;
    
    // Delete associated comments
    await Comment.deleteMany({ post: { $in: postIds } });
    
    const result = await Post.deleteMany({ _id: { $in: postIds } });
    res.json({ message: `Deleted ${result.deletedCount} posts and associated comments` });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ error: 'Failed to delete posts' });
  }
});

router.post('/bulk/reports/update-status', verifyFirebaseModerator, async (req, res) => {
  try {
    const { reportIds, status } = req.body;
    
    const result = await ScamReport.updateMany(
      { _id: { $in: reportIds } },
      { status, updatedAt: Date.now() }
    );
    
    res.json({ message: `Updated ${result.modifiedCount} reports` });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ error: 'Failed to update reports' });
  }
});

// ============= DATA EXPORT =============
router.get('/export/:model', verifyFirebaseAdmin, async (req, res) => {
  try {
    const { model } = req.params;
    const { format = 'json' } = req.query;
    
    let data;
    switch(model) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'posts':
        data = await Post.find().populate('author topic');
        break;
      case 'comments':
        data = await Comment.find().populate('author post');
        break;
      case 'topics':
        data = await Topic.find();
        break;
      case 'scams':
        data = await Scam.find();
        break;
      case 'reports':
        data = await ScamReport.find().populate('userId');
        break;
      case 'analyzer':
        data = await AnalyzerHistory.find().populate('userId');
        break;
      default:
        return res.status(400).json({ error: 'Invalid model' });
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${model}-export.csv`);
      res.send(csvData);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const keys = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
  const csv = [
    keys.join(','),
    ...data.map(item => {
      const obj = item.toObject ? item.toObject() : item;
      return keys.map(key => {
        const value = obj[key];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(',');
    })
  ].join('\n');
  
  return csv;
}

export default router;

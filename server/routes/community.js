import express from 'express';
import Topic from '../models/Topic.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { verifyFirebaseAuth } from '../middleware/firebaseAdminAuth.js';

const router = express.Router();

// Helper function to find or create MongoDB User from Firebase UID
const getOrCreateUserFromFirebase = async (firebaseUid) => {
  try {
    // First try to find existing user by firebaseUid
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      // If user doesn't exist, we need to get user info from Firebase
      // For now, we'll create a placeholder user
      // In production, you should verify the Firebase token and get user details
      user = new User({
        username: `user_${firebaseUid.substring(0, 8)}`, // Generate a username
        email: `${firebaseUid}@firebase.local`, // Placeholder email
        firebaseUid: firebaseUid,
        // No password required for Firebase users
      });
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error getting/creating user from Firebase UID:', error);
    throw error;
  }
};

// Middleware to check if user is authenticated (optional for some routes)
const requireAuth = (req, res, next) => {
  // For Firebase auth, we'll check if Authorization header is present
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // Store the Firebase user ID for use in routes
  req.firebaseUserId = token;
  next();
};

// Get all topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find({ isActive: true }).sort('name');
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Get posts by topic with pagination
router.get('/posts', async (req, res) => {
  try {
    const { topicId, page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { status: 'active' };
    if (topicId && topicId !== 'all') {
      query.topic = topicId;
    }
    
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { likes: -1, views: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'recent':
      default:
        sortOption = { createdAt: -1 };
    }
    
    // First get pinned posts
    const pinnedPosts = await Post.find({ ...query, isPinned: true })
      .populate('author', 'username level')
      .populate('topic', 'name icon color')
      .populate('commentCount')
      .sort(sortOption);
    
    // Then get regular posts
    const regularPosts = await Post.find({ ...query, isPinned: false })
      .populate('author', 'username level')
      .populate('topic', 'name icon color')
      .populate('commentCount')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const posts = [...pinnedPosts, ...regularPosts];
    
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    
    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post with comments
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Increment view count
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
    
    const post = await Post.findById(postId)
      .populate('author', 'username level totalPoints')
      .populate('topic', 'name icon color');
    
    if (!post || post.status !== 'active') {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Get comments with nested replies
    const comments = await Comment.find({ 
      post: postId, 
      parentComment: null,
      status: 'active' 
    })
      .populate('author', 'username level')
      .populate({
        path: 'replyCount'
      })
      .sort('-createdAt');
    
    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ 
          parentComment: comment._id,
          status: 'active'
        })
          .populate('author', 'username level')
          .sort('createdAt');
        
        return {
          ...comment.toJSON(),
          replies
        };
      })
    );
    
    res.json({
      post,
      comments: commentsWithReplies
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/posts', requireAuth, async (req, res) => {
  try {
    const { title, content, topicId, tags } = req.body;
    
    if (!title || !content || !topicId) {
      return res.status(400).json({ error: 'Title, content, and topic are required' });
    }
    
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Get or create MongoDB User from Firebase UID
    const user = await getOrCreateUserFromFirebase(req.firebaseUserId);
    
    const post = new Post({
      title,
      content,
      author: user._id, // Use MongoDB ObjectId
      topic: topicId,
      tags: tags || []
    });
    
    await post.save();
    
    // Increment topic post count
    await Topic.findByIdAndUpdate(topicId, { $inc: { postCount: 1 } });
    
    // Award points to user for creating a post
    await User.findByIdAndUpdate(user._id, { $inc: { totalPoints: 10 } });
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username level')
      .populate('topic', 'name icon color');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like/unlike a post
router.post('/posts/:postId/like', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const user = await getOrCreateUserFromFirebase(req.firebaseUserId);
    const userId = user._id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
      
      // Award points to post author (not to self)
      if (post.author.toString() !== userId) {
        await User.findByIdAndUpdate(post.author, { $inc: { totalPoints: 2 } });
      }
    }
    
    await post.save();
    
    res.json({ 
      liked: !isLiked, 
      likeCount: post.likes.length 
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Create comment
router.post('/posts/:postId/comments', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const post = await Post.findById(postId);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.isLocked) {
      return res.status(403).json({ error: 'This post is locked for comments' });
    }
    
    // Get or create MongoDB User from Firebase UID
    const user = await getOrCreateUserFromFirebase(req.firebaseUserId);
    
    const comment = new Comment({
      content,
      author: user._id, // Use MongoDB ObjectId
      post: postId,
      parentComment: parentCommentId || null
    });
    
    await comment.save();
    
    // Award points for commenting
    await User.findByIdAndUpdate(user._id, { $inc: { totalPoints: 5 } });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username level');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Like/unlike a comment
router.post('/comments/:commentId/like', requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = await getOrCreateUserFromFirebase(req.firebaseUserId);
    const userId = user._id;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const isLiked = comment.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      comment.likes.push(userId);
      
      // Award points to comment author (not to self)
      if (comment.author.toString() !== userId) {
        await User.findByIdAndUpdate(comment.author, { $inc: { totalPoints: 1 } });
      }
    }
    
    await comment.save();
    
    res.json({ 
      liked: !isLiked, 
      likeCount: comment.likes.length 
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q, topicId } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let query = {
      status: 'active',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    
    if (topicId && topicId !== 'all') {
      query.topic = topicId;
    }
    
    const posts = await Post.find(query)
      .populate('author', 'username level')
      .populate('topic', 'name icon color')
      .sort('-createdAt')
      .limit(20);
    
    res.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Initialize default topics (run once)
router.post('/topics/init', async (req, res) => {
  try {
    const existingTopics = await Topic.countDocuments();
    if (existingTopics > 0) {
      return res.json({ message: 'Topics already initialized' });
    }
    
    const defaultTopics = [
      {
        name: 'General Discussion',
        description: 'General conversations about online safety and scam prevention',
        icon: '💬',
        color: '#3B82F6'
      },
      {
        name: 'Scam Alerts',
        description: 'Share and discuss latest scam alerts and warnings',
        icon: 'alert',
        color: '#EF4444'
      },
      {
        name: 'Success Stories',
        description: 'Share your success stories in avoiding or reporting scams',
        icon: 'celebration',
        color: '#10B981'
      },
      {
        name: 'Help & Support',
        description: 'Get help and support from the community',
        icon: '🤝',
        color: '#8B5CF6'
      },
      {
        name: 'Educational Resources',
        description: 'Share and discuss educational content about online safety',
        icon: '📚',
        color: '#F59E0B'
      },
      {
        name: 'Tech Tips',
        description: 'Technical tips and tricks for staying safe online',
        icon: '💻',
        color: '#06B6D4'
      }
    ];
    
    await Topic.insertMany(defaultTopics);
    res.json({ message: 'Topics initialized successfully' });
  } catch (error) {
    console.error('Error initializing topics:', error);
    res.status(500).json({ error: 'Failed to initialize topics' });
  }
});

export default router;

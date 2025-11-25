import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Eye,
  Heart,
  MessageCircle,
  X,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { communityService } from '../services/backendApi';

interface Topic {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

interface Author {
  _id: string;
  username: string;
  level: number;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: Author;
  topic: Topic;
  tags: string[];
  likes: string[];
  views: number;
  createdAt: string;
  commentCount?: number;
}

interface Comment {
  _id: string;
  content: string;
  author: Author;
  createdAt: string;
}

export default function Community() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    topicId: '',
    tags: ''
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTopics();
    initializeTopics();
  }, []);

  useEffect(() => {
    if (!selectedPost) {
      fetchPosts();
    }
  }, [selectedTopic, sortBy]);

  const initializeTopics = async () => {
    try {
      await communityService.initializeTopics();
    } catch (error: any) {
      // Silently fail - topics initialization is optional
      if (error.code !== 'ERR_NETWORK') {
        console.error('Error initializing topics:', error);
      }
    }
  };

  const fetchTopics = async () => {
    try {
      const data = await communityService.getTopics();
      setTopics(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching topics:', error);
      if (error.code === 'ERR_NETWORK') {
        console.warn('Backend server is not running. Community features will be unavailable.');
      }
      setTopics([]);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await communityService.getPosts({
        topicId: selectedTopic === 'all' ? undefined : selectedTopic,
        page: 1,
        limit: 20,
        sort: sortBy
      });
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      if (error.code === 'ERR_NETWORK') {
        console.warn('Backend server is not running. Community features will be unavailable.');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (postId: string) => {
    try {
      const data = await communityService.getPostDetails(postId);
      setSelectedPost(data.post);
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (error: any) {
      console.error('Error fetching post details:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Unable to load post details. Please check if the server is running.');
      }
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.topicId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('Please log in to create posts');
      return;
    }

    try {
      const post = await communityService.createPost({
        title: newPost.title,
        content: newPost.content,
        topicId: newPost.topicId,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      
      setPosts([post, ...posts]);
      setShowNewPostModal(false);
      setNewPost({ title: '', content: '', topicId: '', tags: '' });
      toast.success('Post created successfully!');
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Unable to create post. Please check if the server is running.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to create post');
      }
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    if (!user) {
      toast.error('Please log in to comment');
      return;
    }

    try {
      const comment = await communityService.createComment(selectedPost._id, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error: any) {
      console.error('Error creating comment:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Unable to post comment. Please check if the server is running.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to post comment');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('community.justNow', 'just now');
    if (diffMins < 60) return t('community.minAgo', '{{mins}} min ago', { mins: diffMins });
    if (diffHours < 24) return t('community.hourAgo', '{{hours}} hour ago', { hours: diffHours });
    if (diffDays < 30) return t('community.dayAgo', '{{days}} day ago', { days: diffDays });
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('community.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('community.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Topics
            </h2>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedTopic('all')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  selectedTopic === 'all'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">All Topics</div>
              </button>

              {topics.map(topic => (
                <button
                  key={topic._id}
                  onClick={() => setSelectedTopic(topic._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedTopic === topic._id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{topic.icon}</span>
                    <span className="font-medium">{topic.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3">{t('community.sortBy', 'Sort By')}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    sortBy === 'recent' ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  {t('community.mostRecent', 'Most Recent')}
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    sortBy === 'popular' ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  {t('community.mostPopular', 'Most Popular')}
                </button>
                <button
                  onClick={() => setSortBy('views')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    sortBy === 'views' ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  {t('community.mostViewed', 'Most Viewed')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('community.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                {t('community.newPost')}
              </button>
            </div>
          </div>

          {/* Posts or Post Detail */}
          {selectedPost ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <button
                onClick={() => {
                  setSelectedPost(null);
                  setComments([]);
                }}
                className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('common.back')} to discussions
              </button>

              <h2 className="text-2xl font-bold mb-2">{selectedPost.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>By {selectedPost.author.username}</span>
                <span>{formatDate(selectedPost.createdAt)}</span>
                <span>{selectedPost.views} views</span>
              </div>

              <p className="whitespace-pre-wrap mb-6">{selectedPost.content}</p>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">{t('community.comments')}</h3>
                
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('community.addCommentPlaceholder')}
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                  />
                  <button
                    onClick={handleCreateComment}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Post Comment
                  </button>
                </div>

                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.author.username}</span>
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : posts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to start a conversation!</p>
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                posts.map(post => (
                  <div
                    key={post._id}
                    onClick={() => fetchPostDetails(post._id)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.author.username}</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.commentCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t('community.createPost')}</h2>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic *</label>
                <select
                  value={newPost.topicId}
                  onChange={(e) => setNewPost({ ...newPost, topicId: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">{t('common.select')} a topic</option>
                  {topics.map(topic => (
                    <option key={topic._id} value={topic._id}>
                      {topic.icon} {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('community.postTitle')} *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder={t('community.postTitlePlaceholder')}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('community.postContent')} *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder={t('community.postContentPlaceholder')}
                  className="w-full p-3 border rounded-lg"
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('community.tags')}</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder={t('community.tagsPlaceholder')}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowNewPostModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {t('community.cancel')}
              </button>
              <button
                onClick={handleCreatePost}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('community.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Lock, Eye, Heart, Pin } from 'lucide-react';
import DataTable from './shared/DataTable';
import '../styles/kali-theme.css';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  topic: {
    _id: string;
    name: string;
  };
  tags: string[];
  likes: string[];
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const PostsManager: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
      });

      const response = await fetch(`http://localhost:5000/api/admin/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (post: Post) => {
    const newStatus = prompt('Enter new status (active/hidden/deleted):', post.status);
    if (newStatus && ['active', 'hidden', 'deleted'].includes(newStatus)) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/admin/posts/${post._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          fetchPosts();
        }
      } catch (error) {
        console.error('Error updating post:', error);
      }
    }
  };

  const handleDelete = async (post: Post) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleBulkDelete = async (postIds: string[]) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/bulk/posts/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postIds })
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, row: Post) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{value}</div>
          {row.isPinned && <span className="badge badge-warning flex items-center gap-1">
            <Pin className="w-3 h-3" />
            Pinned
          </span>}
          {row.isLocked && <span className="badge badge-danger flex items-center gap-1" style={{ marginLeft: '0.25rem' }}>
            <Lock className="w-3 h-3" />
            Locked
          </span>}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (value: any) => value?.username || 'Unknown'
    },
    {
      key: 'topic',
      label: 'Topic',
      render: (value: any) => (
        <span className="badge badge-info">{value?.name || 'None'}</span>
      )
    },
    {
      key: 'views',
      label: 'Views',
      render: (value: number) => (
        <span style={{ color: 'var(--kali-cyan)' }} className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {value}
        </span>
      )
    },
    {
      key: 'likes',
      label: 'Likes',
      render: (value: string[]) => (
        <span style={{ color: 'var(--kali-yellow)' }} className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          {value.length}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`badge badge-${value === 'active' ? 'success' : value === 'hidden' ? 'warning' : 'danger'}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="terminal-card">
        <div className="terminal-card-header">
          <h2 className="terminal-card-title">📝 POST MANAGEMENT</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-info">Total: {posts.length}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={posts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchable={true}
          onSearch={setSearchQuery}
          selectable={true}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
        />
      </div>
    </div>
  );
};

export default PostsManager;

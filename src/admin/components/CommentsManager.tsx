import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import DataTable from './shared/DataTable';
import '../styles/kali-theme.css';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  post: {
    _id: string;
    title: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

const CommentsManager: React.FC = () => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchComments();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:5000/api/admin/comments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (comment: Comment) => {
    const newStatus = prompt('Enter new status (active/hidden/deleted):', comment.status);
    if (newStatus && ['active', 'hidden', 'deleted'].includes(newStatus)) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:5000/api/admin/comments/${comment._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          fetchComments();
        }
      } catch (error) {
        console.error('Error updating comment:', error);
      }
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/comments/${comment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleBulkDelete = async (commentIds: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${commentIds.length} comments?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/bulk/comments/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentIds })
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error bulk deleting comments:', error);
    }
  };

  const columns = [
    {
      key: 'content',
      label: t('admin.comments.content', 'Content'),
      render: (value: string) => (
        <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      )
    },
    {
      key: 'author',
      label: t('admin.comments.author', 'Author'),
      render: (value: any) => value?.username || t('admin.comments.anonymous', 'Anonymous')
    },
    {
      key: 'post',
      label: t('admin.comments.post', 'Post'),
      render: (value: any) => (
        <span style={{ maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value?.title || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      label: t('admin.comments.status', 'Status'),
      render: (value: string) => (
        <span className={`badge badge-${value === 'active' ? 'success' : value === 'hidden' ? 'warning' : 'danger'}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: t('admin.comments.created', 'Created'),
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="terminal-card">
        <div className="terminal-card-header">
          <h2 className="terminal-card-title flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('admin.comments.management', 'COMMENT MANAGEMENT')}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="terminal-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="deleted">Deleted</option>
            </select>
            <span className="badge badge-info">{t('admin.comments.total', 'Total')}: {comments.length}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={comments}
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

export default CommentsManager;

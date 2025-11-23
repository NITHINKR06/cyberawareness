import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import DataTable from './shared/DataTable';
import '../styles/kali-theme.css';

interface Topic {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  isActive: boolean;
  createdAt: string;
}

const TopicsManager: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    icon: '💬',
    color: '#3B82F6'
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/topics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }

      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/topics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTopic)
      });

      if (response.ok) {
        setShowModal(false);
        setNewTopic({ name: '', description: '', icon: '💬', color: '#3B82F6' });
        fetchTopics();
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setNewTopic({
      name: topic.name,
      description: topic.description,
      icon: topic.icon,
      color: topic.color
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!editingTopic) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/topics/${editingTopic._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTopic)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingTopic(null);
        setNewTopic({ name: '', description: '', icon: '💬', color: '#3B82F6' });
        fetchTopics();
      }
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDelete = async (topic: Topic) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/topics/${topic._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchTopics();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (value: string) => (
        <span style={{ fontSize: '1.5rem' }}>{value}</span>
      ),
      sortable: false
    },
    {
      key: 'name',
      label: 'Name',
      render: (value: string, row: Topic) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 'bold', color: row.color }}>{value}</span>
          {!row.isActive && <span className="badge badge-warning">Inactive</span>}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      )
    },
    {
      key: 'postCount',
      label: 'Posts',
      render: (value: number) => (
        <span className="badge badge-info">{value} posts</span>
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
          <h2 className="terminal-card-title flex items-center gap-2">
            <Tag className="w-5 h-5" />
            TOPIC MANAGEMENT
          </h2>
          <button 
            onClick={() => {
              setEditingTopic(null);
              setNewTopic({ name: '', description: '', icon: '💬', color: '#3B82F6' });
              setShowModal(true);
            }}
            className="terminal-btn terminal-btn-primary"
          >
            ➕ New Topic
          </button>
        </div>

        <DataTable
          columns={columns}
          data={topics}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTopic ? `EDIT TOPIC: ${editingTopic.name}` : 'CREATE NEW TOPIC'}
              </h3>
              <button onClick={() => setShowModal(false)} className="terminal-btn">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Name
                </label>
                <input
                  type="text"
                  className="terminal-input"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                  placeholder="Enter topic name"
                />
              </div>

              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Description
                </label>
                <textarea
                  className="terminal-input"
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  placeholder="Enter topic description"
                  rows={3}
                />
              </div>

              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  className="terminal-input"
                  value={newTopic.icon}
                  onChange={(e) => setNewTopic({ ...newTopic, icon: e.target.value })}
                  placeholder="Enter an emoji"
                />
              </div>

              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Color
                </label>
                <input
                  type="color"
                  className="terminal-input"
                  value={newTopic.color}
                  onChange={(e) => setNewTopic({ ...newTopic, color: e.target.value })}
                  style={{ height: '40px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  onClick={editingTopic ? handleUpdate : handleCreate} 
                  className="terminal-btn terminal-btn-primary"
                >
                  💾 {editingTopic ? 'Update' : 'Create'} Topic
                </button>
                <button onClick={() => setShowModal(false)} className="terminal-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicsManager;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import DataTable from './shared/DataTable';
import '../styles/kali-theme.css';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isAdmin: boolean;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  createdAt: string;
  lastActivity: string;
}

const UsersManager: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
      });

      const response = await fetch(`http://localhost:5000/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user: User) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleBulkDelete = async (userIds: string[]) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/admin/bulk/users/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error);
    }
  };

  const handleBanToggle = async (user: User) => {
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = user.isBanned ? 'unban' : 'ban';
      const response = await fetch(`http://localhost:5000/api/admin/users/${user._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Admin action' })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling ban:', error);
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingUser)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const columns = [
    {
      key: 'username',
      label: t('admin.users.username', 'Username'),
      render: (value: string, row: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{value}</span>
          {row.isAdmin && <span className="badge badge-danger">ADMIN</span>}
        </div>
      )
    },
    {
      key: 'email',
      label: t('admin.users.email', 'Email'),
    },
    {
      key: 'role',
      label: t('admin.users.role', 'Role'),
      render: (value: string) => (
        <span className={`badge badge-${value === 'admin' || value === 'superadmin' ? 'danger' : value === 'moderator' ? 'warning' : 'info'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'level',
      label: t('admin.users.level', 'Level'),
      render: (value: number) => (
        <span style={{ color: 'var(--kali-cyan)' }}>{t('common.level', 'Level {{level}}').replace('{{level}}', value.toString())}</span>
      )
    },
    {
      key: 'totalPoints',
      label: t('admin.users.points', 'Points'),
      render: (value: number) => (
        <span style={{ color: 'var(--kali-yellow)' }} className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          {value}
        </span>
      )
    },
    {
      key: 'isActive',
      label: t('admin.users.status', 'Status'),
      render: (value: boolean, row: User) => {
        if (row.isBanned) {
          return <span className="badge badge-danger">{t('admin.users.banned', 'BANNED')}</span>;
        }
        return <span className={`badge badge-${value ? 'success' : 'warning'}`}>
          {value ? t('admin.users.active', 'ACTIVE') : t('admin.users.inactive', 'INACTIVE')}
        </span>;
      }
    },
    {
      key: 'createdAt',
      label: t('admin.users.joined', 'Joined'),
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: t('admin.users.quickActions', 'Quick Actions'),
      render: (_: any, row: User) => (
        <button
          onClick={() => handleBanToggle(row)}
          className={`terminal-btn ${row.isBanned ? 'terminal-btn-primary' : 'terminal-btn-danger'}`}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
        >
          {row.isBanned ? `✓ ${t('admin.users.unban', 'Unban')}` : `⛔ ${t('admin.users.ban', 'Ban')}`}
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="terminal-card">
        <div className="terminal-card-header">
          <h2 className="terminal-card-title">👥 {t('admin.users.userManagement', 'USER MANAGEMENT')}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-info">{t('admin.users.total', 'Total')}: {users.length}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users}
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

      {/* Edit Modal */}
      {showModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('admin.users.editUser', 'EDIT USER')}: {editingUser.username}</h3>
              <button onClick={() => setShowModal(false)} className="terminal-btn">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  {t('admin.users.username', 'Username')}
                </label>
                <input
                  type="text"
                  className="terminal-input"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>

              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  {t('admin.users.email', 'Email')}
                </label>
                <input
                  type="email"
                  className="terminal-input"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  {t('admin.users.role', 'Role')}
                </label>
                <select
                  className="terminal-select"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="user">{t('admin.users.user', 'User')}</option>
                  <option value="moderator">{t('admin.users.moderator', 'Moderator')}</option>
                  <option value="admin">{t('admin.users.admin', 'Admin')}</option>
                  <option value="superadmin">{t('admin.users.superAdmin', 'Super Admin')}</option>
                </select>
              </div>

              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  {t('admin.users.level', 'Level')}
                </label>
                <input
                  type="number"
                  className="terminal-input"
                  value={editingUser.level}
                  onChange={(e) => setEditingUser({ ...editingUser, level: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ color: 'var(--kali-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  {t('admin.users.totalPoints', 'Total Points')}
                </label>
                <input
                  type="number"
                  className="terminal-input"
                  value={editingUser.totalPoints}
                  onChange={(e) => setEditingUser({ ...editingUser, totalPoints: parseInt(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={handleSaveUser} className="terminal-btn terminal-btn-primary">
                  💾 {t('admin.users.saveChanges', 'Save Changes')}
                </button>
                <button onClick={() => setShowModal(false)} className="terminal-btn">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;

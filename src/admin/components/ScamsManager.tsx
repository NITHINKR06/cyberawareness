import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield } from 'lucide-react';
import { getApiBaseUrl } from '../../services/backendApi';
import DataTable from './shared/DataTable';
import '../styles/kali-theme.css';

interface Scam {
  _id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  websiteUrl?: string;
  phoneNumber?: string;
  emailAddress?: string;
  isVerified: boolean;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

const ScamsManager: React.FC = () => {
  const { t } = useTranslation();
  const [scams, setScams] = useState<Scam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchScams();
  }, [currentPage, searchQuery, categoryFilter]);

  const fetchScams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        ...(categoryFilter && { category: categoryFilter })
      });

      const response = await fetch(`${getApiBaseUrl()}/admin/scams?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scams');
      }

      const data = await response.json();
      setScams(data.scams || data);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching scams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (scam: Scam) => {
    const newCategory = prompt('Enter new category:', scam.category);
    if (newCategory) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${getApiBaseUrl()}/admin/scams/${scam._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ category: newCategory })
        });

        if (response.ok) {
          fetchScams();
        }
      } catch (error) {
        console.error('Error updating scam:', error);
      }
    }
  };

  const handleDelete = async (scam: Scam) => {
    if (!window.confirm('Are you sure you want to delete this scam record?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/scams/${scam._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchScams();
      }
    } catch (error) {
      console.error('Error deleting scam:', error);
    }
  };

  const handleBulkDelete = async (scamIds: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${scamIds.length} scam records?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/bulk/scams/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scamIds })
      });

      if (response.ok) {
        fetchScams();
      }
    } catch (error) {
      console.error('Error bulk deleting scams:', error);
    }
  };

  const handleVerifyToggle = async (scam: Scam) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/scams/${scam._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !scam.isVerified })
      });

      if (response.ok) {
        fetchScams();
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const columns = [
    {
      key: 'title',
      label: t('admin.scams.title', 'Title'),
      render: (value: string) => (
        <span style={{ fontWeight: 'bold' }}>{value}</span>
      )
    },
    {
      key: 'category',
      label: t('admin.scams.category', 'Category'),
      render: (value: string) => (
        <span className="badge badge-info">{value}</span>
      )
    },
    {
      key: 'severity',
      label: t('admin.scams.severity', 'Severity'),
      render: (value: string) => (
        <span className={`badge badge-${value === 'high' ? 'danger' : value === 'medium' ? 'warning' : 'success'}`}>
          {value ? value.toUpperCase() : 'N/A'}
        </span>
      )
    },
    {
      key: 'isVerified',
      label: t('admin.scams.verified', 'Verified'),
      render: (value: boolean, row: Scam) => (
        <button
          onClick={() => handleVerifyToggle(row)}
          className={`terminal-btn ${value ? 'terminal-btn-primary' : ''}`}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
        >
          {value ? '✓ Verified' : '✗ Unverified'}
        </button>
      )
    },
    {
      key: 'reportCount',
      label: t('admin.scams.reports', 'Reports'),
      render: (value: number) => (
        <span style={{ color: 'var(--kali-yellow)' }}>{value}</span>
      )
    },
    {
      key: 'websiteUrl',
      label: t('admin.scams.url', 'URL'),
      render: (value: string) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--kali-blue)' }}>
          {value.length > 30 ? value.substring(0, 30) + '...' : value}
        </a>
      ) : 'N/A'
    },
    {
      key: 'createdAt',
      label: t('admin.scams.created', 'Created'),
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="terminal-card">
        <div className="terminal-card-header">
          <h2 className="terminal-card-title flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('admin.scams.management', 'SCAM DATABASE MANAGEMENT')}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="terminal-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="">All Categories</option>
              <option value="phishing">Phishing</option>
              <option value="fraud">Fraud</option>
              <option value="identity-theft">Identity Theft</option>
              <option value="investment">Investment Scam</option>
              <option value="romance">Romance Scam</option>
              <option value="other">Other</option>
            </select>
            <span className="badge badge-info">{t('admin.scams.total', 'Total')}: {scams.length}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={scams}
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

export default ScamsManager;

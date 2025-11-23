import React, { useState, useEffect } from 'react';
import DataTable from './shared/DataTable';
import '../styles/kali-theme.css';

interface Report {
  _id: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
  };
  sessionId: string;
  scamType: string;
  description: string;
  websiteUrl?: string;
  phoneNumber?: string;
  emailAddress?: string;
  severity: string;
  status: string;
  complaintNumber?: string;
  createdAt: string;
  updatedAt: string;
}

const ReportsManager: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:5000/api/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (report: Report, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/reports/${report._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleBulkStatusUpdate = async (reportIds: string[], status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/bulk/reports/update-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportIds, status })
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error bulk updating reports:', error);
    }
  };

  const handleDelete = async (report: Report) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/reports/${report._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const columns = [
    {
      key: 'complaintNumber',
      label: 'Complaint #',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'scamType',
      label: 'Type',
      render: (value: string) => (
        <span className="badge badge-info">{value}</span>
      )
    },
    {
      key: 'userId',
      label: 'Reporter',
      render: (value: any) => value?.username || 'Anonymous'
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value: string) => (
        <span className={`badge badge-${value === 'high' ? 'danger' : value === 'medium' ? 'warning' : 'success'}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: Report) => (
        <select
          className="terminal-select"
          value={value}
          onChange={(e) => handleStatusUpdate(row, e.target.value)}
          style={{ padding: '0.25rem', fontSize: '0.85rem' }}
        >
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span style={{ maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Reported',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="terminal-card">
        <div className="terminal-card-header">
          <h2 className="terminal-card-title">🚩 SCAM REPORTS MANAGEMENT</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="terminal-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <span className="badge badge-info">Total: {reports.length}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          onDelete={handleDelete}
          searchable={true}
          onSearch={setSearchQuery}
          selectable={true}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
        />

        {/* Quick Actions */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const selected = document.querySelectorAll('input[type="checkbox"]:checked');
              if (selected.length > 0) {
                handleBulkStatusUpdate(
                  Array.from(selected).map((el: any) => el.value),
                  'verified'
                );
              }
            }}
            className="terminal-btn terminal-btn-primary"
          >
            ✓ Mark Selected as Verified
          </button>
          <button
            onClick={() => {
              const selected = document.querySelectorAll('input[type="checkbox"]:checked');
              if (selected.length > 0) {
                handleBulkStatusUpdate(
                  Array.from(selected).map((el: any) => el.value),
                  'resolved'
                );
              }
            }}
            className="terminal-btn"
          >
            ✓ Mark Selected as Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;

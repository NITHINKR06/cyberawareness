import React, { useState } from 'react';
import '../../styles/kali-theme.css';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  searchable?: boolean;
  onSearch?: (query: string) => void;
  selectable?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
  onBulkDelete,
  loading = false,
  pagination,
  searchable = false,
  onSearch,
  selectable = false,
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(row => row._id || row.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedRows.size > 0) {
      if (window.confirm(`Are you sure you want to delete ${selectedRows.size} items?`)) {
        onBulkDelete(Array.from(selectedRows));
        setSelectedRows(new Set());
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="terminal-loader"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Bulk Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
        {searchable && (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              className="terminal-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="terminal-btn">
              🔍 Search
            </button>
          </form>
        )}

        {selectable && selectedRows.size > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--kali-text-secondary)' }}>
              {selectedRows.size} selected
            </span>
            {onBulkDelete && (
              <button onClick={handleBulkDelete} className="terminal-btn terminal-btn-danger">
                🗑️ Delete Selected
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {column.label}
                    {column.sortable !== false && sortConfig?.key === column.key && (
                      <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (onEdit || onDelete ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem' }}>
                  <span style={{ color: 'var(--kali-text-secondary)' }}>No data available</span>
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const rowId = row._id || row.id;
                return (
                  <tr key={rowId}>
                    {selectable && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowId)}
                          onChange={() => handleSelectRow(rowId)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="terminal-btn terminal-btn-primary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                  onDelete(row);
                                }
                              }}
                              className="terminal-btn terminal-btn-danger"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="terminal-btn"
            style={{ opacity: pagination.currentPage === 1 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ color: 'var(--kali-text-secondary)' }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="terminal-btn"
            style={{ opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;

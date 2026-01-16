import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Search, Trash2, MoreVertical } from 'lucide-react';
import ActionButton from '../components/ActionButton';

const AdminInternships = () => {
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadInternships();
  }, []);

  useEffect(() => {
    filterInternships();
  }, [internships, searchTerm, statusFilter]);

  const loadInternships = async () => {
    try {
      const data = await adminService.getAllInternships();
      setInternships(data);
      setFilteredInternships(data);
    } catch (error) {
      console.error('Failed to load internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInternships = () => {
    let filtered = [...internships];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (internship) =>
          internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          internship.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          internship.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (internship) => (internship.status || 'active') === statusFilter
      );
    }

    setFilteredInternships(filtered);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const result = await adminService.updateInternshipStatus(id, newStatus);
      if (result.success) {
        await loadInternships();
      } else {
        alert(result.error || 'Failed to update status');
        // Reload to reset dropdown
        await loadInternships();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
      // Reload to reset dropdown
      await loadInternships();
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await adminService.deleteInternship(id);
      if (result.success) {
        await loadInternships();
        setDeleteConfirm(null);
      } else {
        alert(result.error || 'Failed to delete internship');
      }
    } catch (error) {
      console.error('Failed to delete internship:', error);
      alert('Failed to delete internship');
    }
  };

  const getStatusBadgeColor = (status) => {
    const s = status || 'active';
    switch (s) {
      case 'active':
        return { bg: '#D1FAE5', color: '#059669' };
      case 'paused':
        return { bg: '#FEF3C7', color: '#D97706' };
      case 'archived':
        return { bg: '#E5E7EB', color: '#6B7280' };
      default:
        return { bg: '#F5F7FB', color: '#6B7C93' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Internship Management
      </h2>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: '#6B7C93' }}
          />
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border"
            style={{
              background: '#FFFFFF',
              borderColor: '#CBD5E1',
              fontSize: '14px',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            background: '#FFFFFF',
            borderColor: '#CBD5E1',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Internships List */}
      <div className="space-y-4">
        {filteredInternships.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <p style={{ color: '#6B7C93' }}>No internships found</p>
          </div>
        ) : (
          filteredInternships.map((internship) => {
            const statusColors = getStatusBadgeColor(internship.status);
            const currentStatus = internship.status || 'active';

            return (
              <div
                key={internship.id}
                className="rounded-xl p-4 sm:p-6"
                style={{
                  background: '#F5F7FB',
                  border: '1px solid #D6DEE9',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ background: '#3F6FA6' }}
                      >
                        {internship.company?.[0] || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1" style={{ color: '#2C3E5B' }}>
                          {internship.title || 'Untitled'}
                        </h3>
                        <p className="text-sm mb-1" style={{ color: '#6B7C93' }}>
                          {internship.company || 'Unknown Company'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs mb-2" style={{ color: '#6B7C93' }}>
                          <span>{internship.location || 'Unknown Location'}</span>
                          {internship.mode && (
                            <>
                              <span>•</span>
                              <span>{internship.mode}</span>
                            </>
                          )}
                          {internship.matchScore !== undefined && (
                            <>
                              <span>•</span>
                              <span>Match: {internship.matchScore}%</span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ background: statusColors.bg, color: statusColors.color }}
                          >
                            {currentStatus}
                          </span>
                          {internship.createdAt && (
                            <span className="text-xs" style={{ color: '#6B7C93' }}>
                              Created: {new Date(internship.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(internship.id, e.target.value)}
                      className="px-3 py-2 rounded-lg border text-sm"
                      style={{
                        background: '#FFFFFF',
                        borderColor: '#CBD5E1',
                        fontSize: '14px',
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button
                      onClick={() => setDeleteConfirm(internship)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: '#FEE2E2', color: '#DC2626' }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2C3E5B' }}>
              Confirm Delete
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B7C93' }}>
              Are you sure you want to delete internship <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: '#F5F7FB',
                  color: '#6B7C93',
                  border: '1px solid #D6DEE9',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ background: '#DC2626' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInternships;

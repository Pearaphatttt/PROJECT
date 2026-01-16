import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useAuth } from '../state/authStore';
import { Search, Trash2, RotateCcw, Eye } from 'lucide-react';
import ActionButton from '../components/ActionButton';

const AdminUsers = () => {
  const { email: currentEmail } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (userEmail) => {
    if (userEmail === currentEmail) {
      alert('Cannot delete your own account');
      return;
    }

    try {
      const result = await adminService.deleteUser(userEmail);
      if (result.success) {
        // Refresh the list from service
        await loadUsers();
        setDeleteConfirm(null);
      } else {
        alert(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleRestore = async (userEmail) => {
    try {
      const result = await adminService.restoreUser(userEmail);
      if (result.success) {
        // Refresh the list from service
        await loadUsers();
      } else {
        alert(result.error || 'Failed to restore user');
      }
    } catch (error) {
      console.error('Failed to restore user:', error);
      alert('Failed to restore user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return { bg: '#E0F2FE', color: '#0369A1' };
      case 'company':
        return { bg: '#F3E8FF', color: '#7C3AED' };
      case 'admin':
        return { bg: '#FEE2E2', color: '#DC2626' };
      default:
        return { bg: '#F5F7FB', color: '#6B7C93' };
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', color: '#059669' };
      case 'deleted':
        return { bg: '#FEE2E2', color: '#DC2626' };
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
        User Management
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
            placeholder="Search by email..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            background: '#FFFFFF',
            borderColor: '#CBD5E1',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="company">Company</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users List - Desktop Table */}
      <div className="hidden md:block">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: '#F5F7FB',
            border: '1px solid #D6DEE9',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #D6DEE9' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6B7C93' }}>
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6B7C93' }}>
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6B7C93' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6B7C93' }}>
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase" style={{ color: '#6B7C93' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center" style={{ color: '#6B7C93' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleColors = getRoleBadgeColor(user.role);
                  const statusColors = getStatusBadgeColor(user.status);
                  const isCurrentUser = user.email === currentEmail;
                  const isDemo = user.isDemo || user.email === 'admin' || user.email === 'test@stu.com' || user.email === 'test@hr.com';

                  return (
                    <tr
                      key={user.email}
                      style={{ borderBottom: '1px solid #D6DEE9' }}
                      className="hover:bg-white transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: '#2C3E5B' }}>
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ background: roleColors.bg, color: roleColors.color }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ background: statusColors.bg, color: statusColors.color }}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#6B7C93' }}>
                        {user.registeredAt
                          ? new Date(user.registeredAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewUser(user)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ background: '#F5F7FB', color: '#3F6FA6' }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {user.status === 'deleted' ? (
                            <button
                              onClick={() => handleRestore(user.email)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ background: '#F5F7FB', color: '#10B981' }}
                              title="Restore"
                            >
                              <RotateCcw size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(user)}
                              disabled={isDemo || isCurrentUser}
                              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: isDemo || isCurrentUser ? '#F5F7FB' : '#FEE2E2',
                                color: isDemo || isCurrentUser ? '#9CA3AF' : '#DC2626',
                              }}
                              title={isDemo ? 'Cannot delete demo account' : isCurrentUser ? 'Cannot delete your own account' : 'Delete'}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <p style={{ color: '#6B7C93' }}>No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const roleColors = getRoleBadgeColor(user.role);
            const statusColors = getStatusBadgeColor(user.status);
            const isCurrentUser = user.email === currentEmail;
            const isDemo = user.isDemo || user.email === 'admin' || user.email === 'test@stu.com' || user.email === 'test@hr.com';

            return (
              <div
                key={user.email}
                className="rounded-xl p-4"
                style={{
                  background: '#F5F7FB',
                  border: '1px solid #D6DEE9',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium mb-2" style={{ color: '#2C3E5B' }}>
                      {user.email}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: roleColors.bg, color: roleColors.color }}
                      >
                        {user.role}
                      </span>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: statusColors.bg, color: statusColors.color }}
                      >
                        {user.status || 'active'}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: '#6B7C93' }}>
                      Created: {user.registeredAt
                        ? new Date(user.registeredAt).toLocaleDateString()
                        : '-'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewUser(user)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: '#FFFFFF', color: '#3F6FA6' }}
                    >
                      <Eye size={16} />
                    </button>
                    {user.status === 'deleted' ? (
                      <button
                        onClick={() => handleRestore(user.email)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ background: '#FFFFFF', color: '#10B981' }}
                      >
                        <RotateCcw size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        disabled={isDemo || isCurrentUser}
                        className="p-2 rounded-lg transition-colors disabled:opacity-50"
                        style={{
                          background: '#FFFFFF',
                          color: isDemo || isCurrentUser ? '#9CA3AF' : '#DC2626',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
              Are you sure you want to delete user <strong>{deleteConfirm.email}</strong>? This action cannot be undone.
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
                onClick={() => handleDelete(deleteConfirm.email)}
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ background: '#DC2626' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2C3E5B' }}>
              User Details
            </h3>
            <div className="space-y-3 mb-6">
              <div>
                <div className="text-xs mb-1" style={{ color: '#6B7C93' }}>Email</div>
                <div className="font-medium" style={{ color: '#2C3E5B' }}>{viewUser.email}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#6B7C93' }}>Role</div>
                <div className="font-medium" style={{ color: '#2C3E5B' }}>{viewUser.role}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#6B7C93' }}>Status</div>
                <div className="font-medium" style={{ color: '#2C3E5B' }}>{viewUser.status || 'active'}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#6B7C93' }}>Created At</div>
                <div className="font-medium" style={{ color: '#2C3E5B' }}>
                  {viewUser.registeredAt
                    ? new Date(viewUser.registeredAt).toLocaleString()
                    : '-'}
                </div>
              </div>
              {viewUser.deletedAt && (
                <div>
                  <div className="text-xs mb-1" style={{ color: '#6B7C93' }}>Deleted At</div>
                  <div className="font-medium" style={{ color: '#2C3E5B' }}>
                    {new Date(viewUser.deletedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: '#3F6FA6',
                  color: 'white',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

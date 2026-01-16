import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, GraduationCap, Building2, FileText } from 'lucide-react';
import { adminService } from '../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: '#3F6FA6',
    },
    {
      label: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: '#10B981',
    },
    {
      label: 'Total Companies',
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: '#8B5CF6',
    },
    {
      label: 'Total Internships',
      value: stats?.totalInternships || 0,
      icon: Briefcase,
      color: '#F59E0B',
    },
    {
      label: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: '#EF4444',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      {/* Welcome Section */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#2C3E5B' }}>
          Welcome, Admin!
        </h2>
        <p className="text-sm" style={{ color: '#6B7C93' }}>
          Manage users, internships, and system settings
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl p-6"
              style={{
                background: '#F5F7FB',
                border: '1px solid #D6DEE9',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: card.color }}
                >
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <div className="text-sm mb-2" style={{ color: '#6B7C93' }}>
                {card.label}
              </div>
              <div className="text-3xl font-bold" style={{ color: '#2C3E5B' }}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-6 cursor-pointer transition-transform hover:scale-105"
          style={{
            background: '#F5F7FB',
            border: '1px solid #D6DEE9',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
          onClick={() => navigate('/admin/users')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: '#3F6FA6' }}
            >
              <Users size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#2C3E5B' }}>
              Manage Users
            </h3>
          </div>
          <p className="text-sm" style={{ color: '#6B7C93' }}>
            View and manage student and company accounts
          </p>
        </div>

        <div
          className="rounded-xl p-6 cursor-pointer transition-transform hover:scale-105"
          style={{
            background: '#F5F7FB',
            border: '1px solid #D6DEE9',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
          onClick={() => navigate('/admin/internships')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: '#3F6FA6' }}
            >
              <Briefcase size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#2C3E5B' }}>
              Manage Internships
            </h3>
          </div>
          <p className="text-sm" style={{ color: '#6B7C93' }}>
            View and manage all internships
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

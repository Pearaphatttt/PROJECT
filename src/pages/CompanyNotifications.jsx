import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { notificationService } from '../services/notificationService';
import { Bell, CheckCircle, UserPlus, MessageSquare, ArrowLeft, Eye } from 'lucide-react';
import ActionButton from '../components/ActionButton';

const CompanyNotifications = () => {
  const navigate = useNavigate();
  const { email: companyEmail } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!companyEmail) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications('company', companyEmail);
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [companyEmail]);

  useEffect(() => {
    loadNotifications();

    const handleStorage = (event) => {
      const key = notificationService.notifKey('company', companyEmail);
      if (event.key === key) {
        loadNotifications();
      }
    };

    const handleCustom = (event) => {
      if (event.detail?.role === 'company' && event.detail?.email === companyEmail) {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('notifications:changed', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('notifications:changed', handleCustom);
    };
  }, [companyEmail, loadNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!companyEmail) return;
    // Mark as read
    await notificationService.markRead('company', companyEmail, notification.id);
    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, readAt: Date.now() } : n))
    );
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleViewCandidate = async (e, notification) => {
    e.stopPropagation();
    if (!companyEmail || !notification.internshipId || !notification.studentEmail) return;
    
    // Mark as read
    await notificationService.markRead('company', companyEmail, notification.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, readAt: Date.now() } : n))
    );
    
    // Navigate to candidates page with query params
    navigate(`/company/candidates?internship=${notification.internshipId}&student=${notification.studentEmail}&tab=applicants`);
  };

  const handleMarkAllRead = async () => {
    if (!companyEmail) return;
    try {
      await notificationService.markAllRead('company', companyEmail);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: Date.now() })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'apply':
        return <UserPlus size={24} style={{ color: '#3F6FA6' }} />;
      case 'message':
        return <MessageSquare size={24} style={{ color: '#3F6FA6' }} />;
      default:
        return <Bell size={24} style={{ color: '#3F6FA6' }} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <button
        onClick={() => navigate('/company/dashboard')}
        className="flex items-center gap-2 mb-6 text-sm"
        style={{ color: '#3F6FA6' }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#2C3E5B' }}>
          Notifications
        </h2>
        {notifications.length > 0 && (
          <ActionButton onClick={handleMarkAllRead} className="text-sm">
            <CheckCircle size={16} className="mr-2" />
            Mark All Read
          </ActionButton>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: '#F5F7FB',
            border: '1px solid #D6DEE9',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Bell size={48} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
          <p style={{ color: '#6B7C93' }}>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isRead = Boolean(notification.readAt);
            return (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full text-left rounded-xl p-4 transition-colors ${
                isRead ? 'opacity-60' : ''
              }`}
              style={{
                background: isRead ? '#F5F7FB' : '#FFFFFF',
                border: '1px solid #D6DEE9',
                boxShadow: isRead
                  ? 'none'
                  : '0 4px 12px rgba(15, 23, 42, 0.08)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`font-semibold ${isRead ? '' : 'font-bold'}`}
                      style={{ color: '#2C3E5B' }}
                    >
                      {notification.title}
                    </h3>
                    {!isRead && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                        style={{ background: '#3F6FA6' }}
                      />
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#6B7C93' }}>
                    {notification.message}
                  </p>
                  <div className="text-xs" style={{ color: '#CBD5E1' }}>
                    {formatTime(notification.createdAt)}
                  </div>
                  {notification.studentEmail && (
                    <div className="text-xs mt-1 font-medium" style={{ color: '#3F6FA6' }}>
                      Student: {notification.studentEmail}
                    </div>
                  )}
                  {notification.internshipId && (
                    <div className="text-xs mt-1" style={{ color: '#6B7C93' }}>
                      Internship ID: {notification.internshipId}
                    </div>
                  )}
                  {notification.type === 'apply' && notification.internshipId && notification.studentEmail && (
                    <div className="mt-3">
                      <ActionButton
                        onClick={(e) => handleViewCandidate(e, notification)}
                        className="text-sm"
                        style={{ padding: '8px 16px' }}
                      >
                        <Eye size={14} className="mr-2" />
                        View Candidate
                      </ActionButton>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyNotifications;

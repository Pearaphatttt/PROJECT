import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../state/studentStore';
import { notificationService } from '../services/notificationService';
import { Bell, CheckCircle } from 'lucide-react';
import ActionButton from '../components/ActionButton';

const StudentNotifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useStudentStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, this would sync with the service
      // For now, notifications are managed by the store
      const serviceNotifications = await notificationService.getAll();
      // Merge with store notifications (store takes precedence for new ones)
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id);
    if (notification.internshipId) {
      if (notification.type === 'match' || notification.type === 'application') {
        navigate(`/student/internships/${notification.internshipId}`);
      } else if (notification.type === 'message') {
        navigate('/student/chat');
      }
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    markAllNotificationsRead();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match':
        return <CheckCircle size={20} style={{ color: '#10B981' }} />;
      case 'message':
        return <Bell size={20} style={{ color: '#3F6FA6' }} />;
      default:
        return <Bell size={20} style={{ color: '#6B7C93' }} />;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#2C3E5B' }}>
          Notifications
        </h2>
        {notifications.length > 0 && (
          <ActionButton
            onClick={handleMarkAllRead}
            className="text-sm"
            style={{ background: '#6B7C93' }}
          >
            Mark all as read
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
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full text-left rounded-xl p-4 transition-colors ${
                notification.read ? 'opacity-60' : ''
              }`}
              style={{
                background: notification.read ? '#F5F7FB' : '#FFFFFF',
                border: '1px solid #D6DEE9',
                boxShadow: notification.read
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
                      className={`font-semibold ${notification.read ? '' : 'font-bold'}`}
                      style={{ color: '#2C3E5B' }}
                    >
                      {notification.title}
                    </h3>
                    {!notification.read && (
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
                    {formatTime(notification.timestamp)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;


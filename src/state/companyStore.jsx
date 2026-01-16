import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './authStore';
import { notificationService } from '../services/notificationService';

const CompanyContext = createContext(null);

export const useCompanyStore = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompanyStore must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const { email, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [companyEmail, setCompanyEmail] = useState(null);

  useEffect(() => {
    if (role === 'company' && email) {
      setCompanyEmail(email);
    } else {
      setCompanyEmail(null);
      setNotifications([]);
    }
  }, [email, role]);

  // Load notifications from notificationService when companyEmail is available
  useEffect(() => {
    if (companyEmail) {
      loadNotifications();
    }
  }, [companyEmail]);

  // Listen for new notifications (optional, for real-time updates)
  useEffect(() => {
    if (!companyEmail) return;
    
    const handleNotification = (event) => {
      if (event.detail?.role === 'company' && event.detail?.email === companyEmail) {
        loadNotifications();
      }
    };

    window.addEventListener('notifications:changed', handleNotification);
    return () => window.removeEventListener('notifications:changed', handleNotification);
  }, [companyEmail]);

  const loadNotifications = async () => {
    if (!companyEmail) return;
    try {
      const data = await notificationService.getNotifications('company', companyEmail);
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const addNotification = (notification) => {
    // This is now handled by notificationService.pushNotification()
    // Keep for backward compatibility with window events, but also persist via service
    if (companyEmail) {
      notificationService.pushNotification('company', companyEmail, notification).then(() => {
        loadNotifications();
      });
    } else {
      setNotifications((prev) => [notification, ...prev]);
    }
  };

  const markNotificationRead = async (id) => {
    if (companyEmail) {
      await notificationService.markRead('company', companyEmail, id);
      loadNotifications();
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const markAllNotificationsRead = async () => {
    if (companyEmail) {
      await notificationService.markAllRead('company', companyEmail);
      loadNotifications();
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <CompanyContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

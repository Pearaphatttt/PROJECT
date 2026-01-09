import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext(null);

export const useStudentStore = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentStore must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [appliedInternshipIds, setAppliedInternshipIds] = useState(new Set());
  const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());
  const [matchedInternshipIds, setMatchedInternshipIds] = useState(new Set());
  const [skippedInternshipIds, setSkippedInternshipIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentChatInternshipId, setCurrentChatInternshipId] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('studentAppState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAppliedInternshipIds(new Set(parsed.appliedInternshipIds || []));
        setSavedInternshipIds(new Set(parsed.savedInternshipIds || []));
        setMatchedInternshipIds(new Set(parsed.matchedInternshipIds || []));
        setSkippedInternshipIds(new Set(parsed.skippedInternshipIds || []));
        setNotifications(parsed.notifications || []);
        setCurrentChat(parsed.currentChat || null);
        setCurrentChatInternshipId(parsed.currentChatInternshipId || null);
      } catch (e) {
        console.error('Failed to load student state:', e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const state = {
      appliedInternshipIds: Array.from(appliedInternshipIds),
      savedInternshipIds: Array.from(savedInternshipIds),
      matchedInternshipIds: Array.from(matchedInternshipIds),
      skippedInternshipIds: Array.from(skippedInternshipIds),
      notifications,
      currentChat,
      currentChatInternshipId,
    };
    localStorage.setItem('studentAppState', JSON.stringify(state));
  }, [appliedInternshipIds, savedInternshipIds, matchedInternshipIds, skippedInternshipIds, notifications, currentChat, currentChatInternshipId]);

  const applyToInternship = (id) => {
    setAppliedInternshipIds((prev) => new Set([...prev, id]));
  };

  const withdrawFromInternship = (id) => {
    setAppliedInternshipIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const saveInternship = (id) => {
    setSavedInternshipIds((prev) => new Set([...prev, id]));
  };

  const unsaveInternship = (id) => {
    setSavedInternshipIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const skipInternship = (id) => {
    setSkippedInternshipIds((prev) => new Set([...prev, id]));
  };

  const matchInternship = (id) => {
    setMatchedInternshipIds((prev) => new Set([...prev, id]));
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const setChat = (internshipId, messages) => {
    setCurrentChatInternshipId(internshipId);
    setCurrentChat(messages || []);
  };

  const addChatMessage = (message) => {
    setCurrentChat((prev) => [...(prev || []), message]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <StudentContext.Provider
      value={{
        appliedInternshipIds,
        savedInternshipIds,
        matchedInternshipIds,
        skippedInternshipIds,
        notifications,
        currentChat,
        currentChatInternshipId,
        unreadCount,
        applyToInternship,
        withdrawFromInternship,
        saveInternship,
        unsaveInternship,
        skipInternship,
        matchInternship,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        setChat,
        addChatMessage,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};


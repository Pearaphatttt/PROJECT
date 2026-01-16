import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { readJSON } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storageKeys';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isLoggedIn, role, email, logout } = useAuth();

  // Check if current user is deleted
  useEffect(() => {
    if (isLoggedIn && email) {
      const demoAccounts = ['admin', 'test@stu.com', 'test@hr.com'];
      
      // Demo accounts are always active
      if (demoAccounts.includes(email)) {
        return;
      }
      
      // Check registered users
      const registeredUsers = readJSON(STORAGE_KEYS.REGISTERED_USERS, {});
      const user = registeredUsers[email];
      
      // If user exists and is deleted, force logout
      if (user && user.status === 'deleted') {
        logout();
      }
    }
  }, [isLoggedIn, email, logout]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const stored = readJSON(STORAGE_KEYS.AUTH);
    if (!stored || !stored.isLoggedIn || !stored.email) {
      logout();
    }
  }, [isLoggedIn, logout]);

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;


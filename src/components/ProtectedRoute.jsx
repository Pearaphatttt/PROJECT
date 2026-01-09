import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;


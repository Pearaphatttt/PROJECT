import React, { createContext, useContext, useState, useEffect } from 'react';
import { readJSON, writeJSON, removeKey } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storageKeys';

const AuthContext = createContext(null);

const USERS_KEY = STORAGE_KEYS.REGISTERED_USERS;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    role: null,
    email: null,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = readJSON(STORAGE_KEYS.AUTH);
    if (stored && stored.isLoggedIn && stored.email) {
      // Check if user is still active (not deleted)
      const registeredUsers = readJSON(USERS_KEY, {});
      const user = registeredUsers[stored.email];
      
      // If user exists in registeredUsers and is deleted, force logout
      if (user && user.status === 'deleted') {
        setAuthState({
          isLoggedIn: false,
          role: null,
          email: null,
        });
        removeKey(STORAGE_KEYS.AUTH);
        return;
      }
      
      // Check demo accounts (they're always active)
      const demoAccounts = ['admin', 'test@stu.com', 'test@hr.com'];
      if (demoAccounts.includes(stored.email)) {
        setAuthState(stored);
        return;
      }
      
      // If user is not in registeredUsers and not a demo account, force logout
      if (!user && !demoAccounts.includes(stored.email)) {
        setAuthState({
          isLoggedIn: false,
          role: null,
          email: null,
        });
        removeKey(STORAGE_KEYS.AUTH);
        return;
      }
      
      setAuthState(stored);
    }
  }, []);

  const getRegisteredUsers = () => {
    return readJSON(USERS_KEY, {});
  };

  const saveRegisteredUsers = (users) => {
    writeJSON(USERS_KEY, users);
  };

  const register = (email, password, role) => {
    const registeredUsers = getRegisteredUsers();
    
    // Check if email already exists
    if (registeredUsers[email]) {
      return { success: false, error: 'Email already registered' };
    }

    // Check test accounts
    const testUsers = {
      'test@stu.com': { password: 'P@ssw0rd', role: 'student' },
      'test@hr.com': { password: 'P@ssw0rd', role: 'company' },
    };
    
    if (testUsers[email] || registeredUsers[email]) {
      return { success: false, error: 'Email already registered' };
    }

    // Register new user
    registeredUsers[email] = {
      password: password,
      role: role,
    };
    saveRegisteredUsers(registeredUsers);

    return { success: true };
  };

  const login = (email, password) => {
    // Demo accounts (always active, cannot be deleted)
    const demoUsers = {
      'test@stu.com': {
        password: 'P@ssw0rd',
        role: 'student',
        status: 'active',
      },
      'test@hr.com': {
        password: 'P@ssw0rd',
        role: 'company',
        status: 'active',
      },
      'admin': {
        password: 'P@ssw0rd',
        role: 'admin',
        status: 'active',
      },
    };

    // Check demo users first
    let user = demoUsers[email];
    
    // If not found in demo users, check registered users
    if (!user) {
      const registeredUsers = getRegisteredUsers();
      user = registeredUsers[email];
      
      // If user not found in registered users, reject
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Check if user is deleted
      const userStatus = user.status || 'active';
      if (userStatus === 'deleted') {
        return { success: false, error: 'Account has been disabled. Please contact administrator.' };
      }
    }

    // Verify password
    if (user && user.password === password) {
      const newState = {
        isLoggedIn: true,
        role: user.role,
        email: email,
      };
      setAuthState(newState);
      writeJSON(STORAGE_KEYS.AUTH, newState);
      return { success: true, role: user.role };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setAuthState({
      isLoggedIn: false,
      role: null,
      email: null,
    });
    removeKey(STORAGE_KEYS.AUTH);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};


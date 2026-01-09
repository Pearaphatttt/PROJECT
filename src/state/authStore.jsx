import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

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
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState(parsed);
      } catch (e) {
        localStorage.removeItem('auth');
      }
    }
  }, []);

  const getRegisteredUsers = () => {
    const stored = localStorage.getItem('registeredUsers');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const saveRegisteredUsers = (users) => {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
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
    // Test credentials
    const testUsers = {
      'test@stu.com': {
        password: 'P@ssw0rd',
        role: 'student',
      },
      'test@hr.com': {
        password: 'P@ssw0rd',
        role: 'company',
      },
    };

    // Check test users first
    let user = testUsers[email];
    
    // If not found in test users, check registered users
    if (!user) {
      const registeredUsers = getRegisteredUsers();
      user = registeredUsers[email];
    }

    if (user && user.password === password) {
      const newState = {
        isLoggedIn: true,
        role: user.role,
        email: email,
      };
      setAuthState(newState);
      localStorage.setItem('auth', JSON.stringify(newState));
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
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};


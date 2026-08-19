// src/utils/AuthContext.js - REST API + JWT Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Restore user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Verify token validity with backend
          authService.getCurrentUser()
            .then(res => {
              if (res.user) {
                setUser(res.user);
                localStorage.setItem('user', JSON.stringify(res.user));
              }
            })
            .catch(() => {
              // Token invalid
              logout();
            });
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Standard Login
  const login = async (email, password, role = 'student') => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authService.login({ email, password, role });
      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, user: res.user };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (error) {
      setAuthError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Standard Signup / Register
  const signup = async (email, password, additionalData = {}) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authService.register({
        email,
        password,
        name: additionalData.name || email.split('@')[0],
        role: additionalData.role || 'student',
        phone: additionalData.phone,
        ...additionalData
      });

      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, user: res.user };
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (error) {
      setAuthError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    return { success: true };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    authError,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

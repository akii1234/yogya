import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, refreshToken } from '../services/api';
import api from '../services/api';

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
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    console.log('AuthContext: Checking auth status...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      console.log('AuthContext: Token exists:', !!token);
      console.log('AuthContext: User data exists:', !!userData);
      
      if (token && userData) {
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(userData));
        console.log('AuthContext: User authenticated from localStorage');
      } else {
        console.log('AuthContext: No stored auth data found');
      }
    } catch (error) {
      console.error('AuthContext: Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
      console.log('AuthContext: Auth check completed, loading set to false');
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await loginApi(email, password);
      
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await registerApi(userData);
      
      if (result.success) {
        return { success: true, message: 'Registration successful' };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put('/users/profiles/update_profile/', profileData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Role-based helper functions
  const isHR = () => user?.role === 'hr' || user?.role === 'hiring_manager' || user?.role === 'admin';
  const isCandidate = () => user?.role === 'candidate';
  const isAdmin = () => user?.role === 'admin';
  const isAuthenticated = () => !!user;

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isHR,
    isCandidate,
    isAdmin,
    isAuthenticated,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
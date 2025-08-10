import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Container,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [localError, setLocalError] = useState(null);
  
  const { login, error, clearError } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error || localError) {
      clearError();
      setLocalError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setLoading(true); // Show loading screen immediately when login starts
    setUserRole(null); // Reset role to ensure we start with generic loading
    
    try {
      console.log('🔍 DEBUG: Starting login process...');
      const result = await login(formData.email, formData.password);
      
      if (result.success && result.user) {
        // Role detected, update the loading screen immediately
        console.log('🎯 Login successful, role detected:', result.user.role);
        console.log('🎯 User object:', result.user);
        setUserRole(result.user.role);
        
        // Keep loading for a bit more to show the role-specific loading screen
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } else {
        console.log('❌ Login failed:', result.error);
        setLocalError(result.error || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLocalError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // Show loading screen during login (this should take precedence over App.jsx loading screen)
  if (loading) {
    console.log('🔍 DEBUG: LoginForm showing LoadingScreen with role:', userRole);
    return (
      <LoadingScreen 
        message="Signing you in..." 
        role={userRole}
        onRoleDetected={(role) => {
          console.log('🎯 Role detected in LoadingScreen:', role);
          if (role === 'completed') {
            console.log('🎯 Loading completed, transitioning to main app');
            setLoading(false);
          }
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        width: '100%',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#db0011',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                mb: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Yogya
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666666',
                fontWeight: 500,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Sign in to your account
            </Typography>
          </Box>

          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#db0011',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#db0011',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#db0011',
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#db0011',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#db0011',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#db0011',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#db0011',
                '&:hover': {
                  backgroundColor: '#a8000d',
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                },
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px',
                py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                href="#"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSwitchToRegister) onSwitchToRegister();
                }}
                sx={{
                  color: '#db0011',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#a8000d',
                    textDecoration: 'underline',
                  },
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm; 
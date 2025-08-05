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

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  
  const { login, error, clearError } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setLoading(false);
    }
  };

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

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
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
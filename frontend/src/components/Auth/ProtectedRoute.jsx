import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallbackComponent = null 
}) => {
  const { user, loading, isAuthenticated, isHR, isCandidate, isAdmin } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#F9FAFB',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#D32F2F', mb: 2 }} />
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return children;
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    return fallbackComponent || (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#F9FAFB',
        }}
      >
        <Typography variant="h5" sx={{ color: '#D32F2F', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          Please log in to access this page.
        </Typography>
      </Box>
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => {
      switch (role) {
        case 'hr':
          return isHR();
        case 'candidate':
          return isCandidate();
        case 'admin':
          return isAdmin();
        default:
          return false;
      }
    });

    if (!hasRequiredRole) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#F9FAFB',
          }}
        >
          <Typography variant="h5" sx={{ color: '#D32F2F', mb: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575', mb: 1 }}>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            Required roles: {allowedRoles.join(', ')}
          </Typography>
        </Box>
      );
    }
  }

  // User is authenticated and has required role, render children
  return children;
};

export default ProtectedRoute; 
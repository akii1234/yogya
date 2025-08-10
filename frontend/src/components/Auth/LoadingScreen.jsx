import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import {
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  AutoAwesome as SparklesIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const LoadingScreen = ({ message = "Preparing your experience...", role = null, onRoleDetected = null }) => {
  const [progress, setProgress] = useState(0);

  // Simulate progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onRoleDetected && role) {
            setTimeout(() => {
              onRoleDetected('completed');
            }, 1000);
          }
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
    };
  }, [role, onRoleDetected]);

  // Generic loading content
  const GenericLoading = () => (
    <Box sx={{ textAlign: 'center' }}>
      {/* Spinner */}
      <Box sx={{ mb: 3 }}>
        <CircularProgress 
          size={80} 
          thickness={4}
          sx={{
            color: '#667eea',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </Box>

      {/* Welcome Message */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
        Welcome to the World of Opportunity!
      </Typography>

      {/* Subtitle */}
      <Typography variant="h6" sx={{ mb: 3, color: '#666', fontWeight: 400 }}>
        {message || "Preparing your experience..."}
      </Typography>

      {/* Progress */}
      <Typography variant="body2" color="text.secondary">
        Loading... {Math.round(progress)}%
      </Typography>
    </Box>
  );

  // HR-specific loading content
  const HRLoading = () => (
    <Box sx={{ textAlign: 'center' }}>
      {/* Spinner */}
      <Box sx={{ mb: 3 }}>
        <CircularProgress 
          size={80} 
          thickness={4}
          sx={{
            color: '#1976d2',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </Box>

      {/* HR Welcome Message */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
        Welcome to Your Hiring Dashboard!
      </Typography>

      {/* HR Subtitle */}
      <Typography variant="h6" sx={{ mb: 3, color: '#666', fontWeight: 400 }}>
        Loading your hiring workspace...
      </Typography>

      {/* HR Feature Chips */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <Chip
          label="AI Matching"
          size="small"
          icon={<BrainIcon />}
          sx={{ background: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }}
        />
        <Chip
          label="Candidate Analytics"
          size="small"
          icon={<AnalyticsIcon />}
          sx={{ background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32' }}
        />
        <Chip
          label="Smart Hiring"
          size="small"
          icon={<SearchIcon />}
          sx={{ background: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02' }}
        />
      </Box>

      {/* Progress */}
      <Typography variant="body2" color="text.secondary">
        Loading HR Dashboard... {Math.round(progress)}%
      </Typography>
    </Box>
  );

  // Candidate-specific loading content
  const CandidateLoading = () => (
    <Box sx={{ textAlign: 'center' }}>
      {/* Spinner */}
      <Box sx={{ mb: 3 }}>
        <CircularProgress 
          size={80} 
          thickness={4}
          sx={{
            color: '#2e7d32',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </Box>

      {/* Candidate Welcome Message */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#2e7d32' }}>
        Welcome to Your Job Journey!
      </Typography>

      {/* Candidate Subtitle */}
      <Typography variant="h6" sx={{ mb: 3, color: '#666', fontWeight: 400 }}>
        Preparing your personalized job matches...
      </Typography>

      {/* Candidate Feature Chips */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <Chip
          label="AI Matching"
          size="small"
          icon={<BrainIcon />}
          sx={{ background: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }}
        />
        <Chip
          label="Smart Analytics"
          size="small"
          icon={<TrendingUpIcon />}
          sx={{ background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32' }}
        />
        <Chip
          label="Personalized"
          size="small"
          icon={<StarIcon />}
          sx={{ background: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02' }}
        />
      </Box>

      {/* Progress */}
      <Typography variant="body2" color="text.secondary">
        Loading Candidate Portal... {Math.round(progress)}%
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Fade in timeout={500}>
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 4,
            maxWidth: 600,
            width: '90%',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Logo/Brand */}
          <Zoom in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #db0011, #a7000e)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Yogya
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI Talent Intelligence & Competency Assessment Engine
              </Typography>
            </Box>
          </Zoom>

          {/* Conditional content based on role */}
          {(() => {
            console.log('🔍 LoadingScreen: role =', role, 'type =', typeof role);
            
            if (role === 'hr' || role === 'hiring_manager' || role === 'admin') {
              console.log('🔍 LoadingScreen: Rendering HRLoading component');
              return <HRLoading />;
            } else if (role === 'candidate') {
              console.log('🔍 LoadingScreen: Rendering CandidateLoading component');
              return <CandidateLoading />;
            } else {
              console.log('🔍 LoadingScreen: Rendering GenericLoading component');
              return <GenericLoading />;
            }
          })()}
        </Paper>
      </Fade>
    </Box>
  );
};

export default LoadingScreen; 
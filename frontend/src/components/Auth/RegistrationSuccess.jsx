import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const RegistrationSuccess = ({ userData, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState('');
  const [progress, setProgress] = useState(0);
  const { login } = useAuth();

  // Motivational quotes for new users
  const motivationalQuotes = [
    "🎉 Welcome to Yogya! Your journey to the perfect job starts here.",
    "🌟 Every expert was once a beginner. You've taken the first step!",
    "🚀 Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "💼 Your skills are your superpower. Let's find the perfect role for you!",
    "🎯 The only way to do great work is to love what you do. Let's discover your passion!",
    "🌈 Your future is bright! Let's build something amazing together.",
    "⚡ Innovation distinguishes between a leader and a follower. You're leading the way!",
    "🎊 Congratulations on joining our community! Great things await you.",
    "💪 The best way to predict the future is to create it. You're doing exactly that!",
    "🌟 You are capable of amazing things. Let's unlock your potential!"
  ];

  useEffect(() => {
    // Set initial quote
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Auto-login after a short delay
    const loginTimeout = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await login(userData.email, userData.password);
        if (result.success) {
          // Successfully logged in, redirect to dashboard
          onComplete();
        } else {
          // If auto-login fails, show manual login option
          setLoading(false);
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        setLoading(false);
      }
    }, 3000); // 3 seconds delay

    return () => {
      clearInterval(progressInterval);
      clearTimeout(loginTimeout);
    };
  }, [userData, login, onComplete]);

  const handleManualLogin = () => {
    onComplete();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        width: '100%',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 600,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        {/* Success Icon */}
        <Box sx={{ mb: 3 }}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80, 
              color: '#4CAF50',
              animation: 'pulse 2s ease-in-out infinite'
            }} 
          />
        </Box>

        {/* Success Message */}
        <Typography
          variant="h4"
          sx={{
            color: '#4CAF50',
            fontWeight: 700,
            mb: 2,
          }}
        >
          Registration Successful! 🎉
        </Typography>

        {/* Motivational Quote */}
        <Card sx={{ mb: 3, bgcolor: '#F8F9FA' }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: '#1976D2',
                fontWeight: 600,
                mb: 1,
                fontStyle: 'italic',
              }}
            >
              {currentQuote}
            </Typography>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Setting up your account...
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress 
              variant="determinate" 
              value={progress} 
              size={24}
              sx={{ color: '#4CAF50' }}
            />
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
        </Box>

        {/* Features Preview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976D2', fontWeight: 600 }}>
            What's Next?
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            <Chip 
              icon={<StarIcon />} 
              label="Upload Resume" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<TrendingUpIcon />} 
              label="Browse Jobs" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<TrophyIcon />} 
              label="Get Matched" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Logging you in automatically...
            </Typography>
          </Box>
        )}

        {/* Manual Login Button (if auto-login fails) */}
        {!loading && (
          <Button
            variant="contained"
            size="large"
            onClick={handleManualLogin}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              bgcolor: '#D32F2F',
              '&:hover': {
                bgcolor: '#B71C1C',
              },
            }}
          >
            Continue to Dashboard
          </Button>
        )}

        {/* Animation Styles */}
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          `}
        </style>
      </Paper>
    </Box>
  );
};

export default RegistrationSuccess; 
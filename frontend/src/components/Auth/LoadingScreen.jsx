import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
  Fade,
  Zoom,
  Slide,
  Chip
} from '@mui/material';
import {
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';

const LoadingScreen = ({ message = "Preparing your experience..." }) => {
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentIcon, setCurrentIcon] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // Motivational quotes for different stages
  const motivationalQuotes = [
    {
      text: "🚀 Your journey to the perfect job starts here...",
      icon: <WorkIcon />,
      color: "#1976d2"
    },
    {
      text: "🌟 Every expert was once a beginner. You've taken the first step!",
      icon: <TrendingUpIcon />,
      color: "#2e7d32"
    },
    {
      text: "💼 Your skills are your superpower. Let's find the perfect role for you!",
      icon: <StarIcon />,
      color: "#ed6c02"
    },
    {
      text: "🎯 The only way to do great work is to love what you do. Let's discover your passion!",
      icon: <TrophyIcon />,
      color: "#9c27b0"
    },
    {
      text: "🌈 Your future is bright! Let's build something amazing together.",
      icon: <BrainIcon />,
      color: "#d32f2f"
    },
    {
      text: "⚡ Innovation distinguishes between a leader and a follower. You're leading the way!",
      icon: <SpeedIcon />,
      color: "#1976d2"
    },
    {
      text: "🎊 Welcome to Yogya! Great things await you.",
      icon: <SparklesIcon />,
      color: "#2e7d32"
    }
  ];

  // Technical loading messages
  const technicalMessages = [
    "🔍 Analyzing your profile...",
    "📊 Matching you with opportunities...",
    "🎯 Preparing personalized recommendations...",
    "🚀 Loading your dashboard...",
    "✨ Finalizing your experience..."
  ];

  useEffect(() => {
    // Start with first quote
    setCurrentQuote(motivationalQuotes[0]);
    setShowProgress(true);

    // Rotate quotes every 2.5 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => {
        const currentIndex = motivationalQuotes.findIndex(q => q.text === prev.text);
        const nextIndex = (currentIndex + 1) % motivationalQuotes.length;
        return motivationalQuotes[nextIndex];
      });
    }, 2500);

    // Rotate icons every 1 second
    const iconInterval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % motivationalQuotes.length);
    }, 1000);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Random progress between 5-20
      });
    }, 800);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(iconInterval);
      clearInterval(progressInterval);
    };
  }, []);

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

      <Fade in={true} timeout={1000}>
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
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Logo/Brand */}
          <Zoom in={true} timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Yogya
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-Powered Competency-Based Hiring Platform
              </Typography>
            </Box>
          </Zoom>

          {/* Main Loading Content */}
          <Slide direction="up" in={true} timeout={1200}>
            <Box sx={{ mb: 4 }}>
              {/* Rotating Icon */}
              <Box sx={{ mb: 3 }}>
                <Zoom in={true} timeout={500}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(45deg, ${currentQuote.color}20, ${currentQuote.color}40)`,
                      border: `2px solid ${currentQuote.color}`,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' }
                      }
                    }}
                  >
                    <Box sx={{ color: currentQuote.color, fontSize: 40 }}>
                      {currentQuote.icon}
                    </Box>
                  </Box>
                </Zoom>
              </Box>

              {/* Motivational Quote */}
              <Fade in={true} timeout={800}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 500,
                    color: 'text.primary',
                    lineHeight: 1.4
                  }}
                >
                  {currentQuote.text}
                </Typography>
              </Fade>

              {/* Technical Message */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, fontStyle: 'italic' }}
              >
                {message}
              </Typography>

              {/* Progress Bar */}
              {showProgress && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${currentQuote.color}, ${currentQuote.color}80)`
                      }
                    }}
                  />
                </Box>
              )}

              {/* Feature Chips */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
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
            </Box>
          </Slide>

          {/* Bottom Message */}
          <Fade in={true} timeout={1500}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt
            </Typography>
          </Fade>
        </Paper>
      </Fade>
    </Box>
  );
};

export default LoadingScreen; 
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Stack
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as XPIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const PracticeSession = ({ question, onSessionComplete, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLimit, setTimeLimit] = useState(question?.time_limit || 15);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionResult, setSessionResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef(null);

  // XP calculation based on difficulty and performance
  const calculateXP = (difficulty, timeUsed, timeLimit, success) => {
    const baseXP = {
      'easy': 50,
      'medium': 100,
      'hard': 200
    };

    const difficultyMultiplier = baseXP[difficulty] || 100;
    const timeEfficiency = Math.max(0.5, 1 - (timeUsed / (timeLimit * 60)));
    const successMultiplier = success ? 1 : 0.3; // 30% XP for attempts
    
    return Math.round(difficultyMultiplier * timeEfficiency * successMultiplier);
  };

  const startSession = () => {
    setIsActive(true);
    setIsPaused(false);
    setTimeElapsed(0);
    setXpEarned(0);
    setSessionResult(null);
    
    intervalRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        if (newTime >= timeLimit * 60) {
          completeSession(false, 'Time limit exceeded');
          return newTime;
        }
        return newTime;
      });
    }, 1000);
  };

  const pauseSession = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeSession = () => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        if (newTime >= timeLimit * 60) {
          completeSession(false, 'Time limit exceeded');
          return newTime;
        }
        return newTime;
      });
    }, 1000);
  };

  const completeSession = (success, reason = '') => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsActive(false);
    setIsPaused(false);
    
    const xp = calculateXP(
      question?.difficulty || 'medium',
      timeElapsed,
      timeLimit,
      success
    );
    
    setXpEarned(xp);
    setSessionResult({
      success,
      reason,
      timeElapsed,
      xp
    });
    setShowResult(true);
    
    if (onSessionComplete) {
      onSessionComplete({
        questionId: question?.id,
        success,
        timeElapsed,
        xp,
        difficulty: question?.difficulty,
        timestamp: new Date().toISOString()
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeProgress = () => {
    return (timeElapsed / (timeLimit * 60)) * 100;
  };

  const getTimeColor = () => {
    const progress = getTimeProgress();
    if (progress > 80) return 'error';
    if (progress > 60) return 'warning';
    return 'primary';
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <>
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                🎯 Practice Session
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {question?.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={question?.difficulty || 'Medium'} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
              <Chip 
                icon={<XPIcon />} 
                label={`${xpEarned} XP`} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              ⏱️ Session Timer
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isActive && !isPaused && (
                <Button
                  variant="contained"
                  startIcon={<StartIcon />}
                  onClick={startSession}
                  sx={{
                    background: 'linear-gradient(45deg, #4caf50, #45a049)',
                    '&:hover': { background: 'linear-gradient(45deg, #45a049, #3d8b40)' }
                  }}
                >
                  Start Session
                </Button>
              )}
              
              {isActive && !isPaused && (
                <Button
                  variant="outlined"
                  startIcon={<PauseIcon />}
                  onClick={pauseSession}
                  sx={{ color: 'warning.main', borderColor: 'warning.main' }}
                >
                  Pause
                </Button>
              )}
              
              {isPaused && (
                <Button
                  variant="contained"
                  startIcon={<StartIcon />}
                  onClick={resumeSession}
                  sx={{
                    background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                    '&:hover': { background: 'linear-gradient(45deg, #f57c00, #ef6c00)' }
                  }}
                >
                  Resume
                </Button>
              )}
              
              {(isActive || isPaused) && (
                <Button
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={() => completeSession(false, 'Session stopped manually')}
                  sx={{ color: 'error.main', borderColor: 'error.main' }}
                >
                  Stop
                </Button>
              )}
            </Box>
          </Box>

          {/* Timer Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon color={getTimeColor()} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: getTimeColor() }}>
                {formatTime(timeElapsed)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              / {formatTime(timeLimit * 60)}
            </Typography>
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={getTimeProgress()}
            color={getTimeColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />

          {/* Session Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Time Remaining: {formatTime(Math.max(0, (timeLimit * 60) - timeElapsed))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Progress: {Math.round(getTimeProgress())}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Success/Failure Buttons */}
      {(isActive || isPaused) && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              🎯 Mark Session Result
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SuccessIcon />}
                onClick={() => completeSession(true, 'Successfully completed')}
                sx={{
                  background: 'linear-gradient(45deg, #4caf50, #45a049)',
                  '&:hover': { background: 'linear-gradient(45deg, #45a049, #3d8b40)' }
                }}
              >
                Mark as Solved
              </Button>
              <Button
                variant="outlined"
                startIcon={<ErrorIcon />}
                onClick={() => completeSession(false, 'Could not solve')}
                sx={{ color: 'error.main', borderColor: 'error.main' }}
              >
                Could Not Solve
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Result Dialog */}
      <Dialog open={showResult} onClose={() => setShowResult(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {sessionResult?.success ? (
            <>
              <TrophyIcon color="success" />
              Session Completed Successfully!
            </>
          ) : (
            <>
              <ErrorIcon color="error" />
              Session Ended
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: sessionResult?.success ? 'success.main' : 'error.main'
              }}
            >
              {sessionResult?.success ? <TrophyIcon fontSize="large" /> : <ErrorIcon fontSize="large" />}
            </Avatar>
            
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              {sessionResult?.success ? 'Great Job!' : 'Keep Practicing!'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {sessionResult?.reason}
            </Typography>

            <Stack spacing={2} sx={{ maxWidth: 300, mx: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Time Used:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatTime(sessionResult?.timeElapsed || 0)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Difficulty:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {question?.difficulty || 'Medium'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">XP Earned:</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  +{sessionResult?.xp || 0} XP
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResult(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowResult(false);
              onClose?.();
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PracticeSession; 
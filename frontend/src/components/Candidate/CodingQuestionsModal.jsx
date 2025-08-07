import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Grid,
  LinearProgress,
  Badge,
  Tooltip,
  Fab,
  Snackbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Code as CodeIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon,
  PlayArrow as PlayIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  AutoAwesome as SparklesIcon,
} from '@mui/icons-material';
import { trackQuestionPerformance } from '../../services/candidateService';

const CodingQuestionsModal = ({ open, onClose, codingQuestions, jobTitle, jobCompany }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showSolutions, setShowSolutions] = useState({});
  const [questionTimers, setQuestionTimers] = useState({});
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleQuestionToggle = (questionId) => (event, isExpanded) => {
    setExpandedQuestion(isExpanded ? questionId : null);
  };

  const toggleSolution = (questionId) => {
    setShowSolutions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Enhanced functionality methods
  const startQuestionTimer = (questionId) => {
    setQuestionTimers(prev => ({
      ...prev,
      [questionId]: { startTime: Date.now(), isRunning: true }
    }));
  };

  const stopQuestionTimer = (questionId) => {
    setQuestionTimers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], isRunning: false }
    }));
  };

  const getQuestionTime = (questionId) => {
    const timer = questionTimers[questionId];
    if (!timer || !timer.startTime) return 0;
    
    const endTime = timer.isRunning ? Date.now() : timer.endTime || Date.now();
    return Math.floor((endTime - timer.startTime) / 1000);
  };

  const handleQuestionComplete = async (questionId, accuracy = 0.8) => {
    try {
      const timeTaken = getQuestionTime(questionId);
      const question = codingQuestions.questions.find(q => q.id === questionId);
      
      const performanceData = {
        questionId,
        timeTaken,
        accuracy,
        difficultyRating: question?.difficulty || 'medium'
      };

      const result = await trackQuestionPerformance(performanceData);
      
      setPerformanceData(prev => ({
        ...prev,
        [questionId]: result
      }));

      setSnackbarMessage(`🎉 Question completed! Earned ${result.xp_earned} XP`);
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      
      stopQuestionTimer(questionId);
    } catch (error) {
      console.error('Error tracking performance:', error);
      setSnackbarMessage('Error tracking performance');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <CheckIcon color="success" />;
      case 'medium': return <WarningIcon color="warning" />;
      case 'hard': return <ErrorIcon color="error" />;
      default: return <CheckIcon />;
    }
  };

  if (!codingQuestions || !codingQuestions.questions) return null;

  const { 
    questions, 
    questions_by_technology, 
    total_questions, 
    technologies, 
    experience_level, 
    estimated_time,
    difficulty_breakdown 
  } = codingQuestions;

  const renderQuestionCard = (question, index) => {
    const isTimerRunning = questionTimers[question.id]?.isRunning;
    const questionTime = getQuestionTime(question.id);
    const performance = performanceData[question.id];
    
    return (
      <Accordion 
        key={question.id} 
        expanded={expandedQuestion === question.id} 
        onChange={handleQuestionToggle(question.id)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {index + 1}. {question.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Timer Display */}
              {isTimerRunning && (
                <Chip
                  icon={<TimerIcon />}
                  label={formatTime(questionTime)}
                  color="warning"
                  variant="outlined"
                  size="small"
                />
              )}
              
              {/* Performance Badge */}
              {performance && (
                <Tooltip title={`Earned ${performance.xp_earned} XP`}>
                  <Chip
                    icon={<StarIcon />}
                    label={`+${performance.xp_earned} XP`}
                    color="success"
                    size="small"
                  />
                </Tooltip>
              )}
              
              {/* Relevance Score */}
              {question.relevance_score && (
                <Tooltip title={`Relevance Score: ${(question.relevance_score * 100).toFixed(1)}%`}>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${(question.relevance_score * 100).toFixed(0)}%`}
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                </Tooltip>
              )}
              
              <Chip 
                label={question.difficulty} 
                color={getDifficultyColor(question.difficulty)}
                size="small"
                icon={getDifficultyIcon(question.difficulty)}
              />
              <Chip 
                label={`${question.time_limit} min`}
                size="small"
                variant="outlined"
                icon={<TimerIcon />}
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {/* Enhanced Question Header with Timer Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                {question.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Timer Controls */}
                {!isTimerRunning && !performance && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlayIcon />}
                    onClick={() => startQuestionTimer(question.id)}
                    color="primary"
                  >
                    Start Timer
                  </Button>
                )}
                
                {isTimerRunning && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckIcon />}
                    onClick={() => handleQuestionComplete(question.id)}
                    color="success"
                  >
                    Complete
                  </Button>
                )}
                
                {performance && (
                  <Chip
                    icon={<TrophyIcon />}
                    label={`Completed in ${formatTime(questionTime)}`}
                    color="success"
                    variant="filled"
                  />
                )}
              </Box>
            </Box>

            {/* Question Description */}
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.description}
            </Typography>

            {/* Enhanced Metadata */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {question.tags && question.tags.map((tag, idx) => (
                <Chip key={idx} label={tag} size="small" variant="outlined" />
              ))}
            </Box>

            {/* Test Cases */}
            {question.test_cases && question.test_cases.length > 0 && (
              <Card variant="outlined" sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Test Cases:
                  </Typography>
                  {question.test_cases.map((testCase, idx) => (
                    <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        <strong>Input:</strong> {JSON.stringify(testCase.input)}
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        <strong>Expected Output:</strong> {JSON.stringify(testCase.output)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Hints */}
            {question.hints && question.hints.length > 0 && (
              <Card variant="outlined" sx={{ mb: 2, bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom color="warning.main">
                    <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Hints:
                  </Typography>
                  <List dense>
                    {question.hints.map((hint, idx) => (
                      <ListItem key={idx} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Typography variant="body2" color="text.secondary">
                            {idx + 1}.
                          </Typography>
                        </ListItemIcon>
                        <ListItemText 
                          primary={hint}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Solution Section */}
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    Solution
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => toggleSolution(question.id)}
                    startIcon={showSolutions[question.id] ? <VisibilityIcon /> : <PlayIcon />}
                  >
                    {showSolutions[question.id] ? 'Hide Solution' : 'Show Solution'}
                  </Button>
                </Box>
                
                {showSolutions[question.id] && (
                  <Card sx={{ bgcolor: '#e3f2fd', mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Solution:
                      </Typography>
                      <Box 
                        component="pre" 
                        sx={{ 
                          bgcolor: '#263238', 
                          color: '#fff', 
                          p: 2, 
                          borderRadius: 1,
                          overflow: 'auto',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          border: '1px solid #37474f',
                          '& code': {
                            color: '#4fc3f7'
                          }
                        }}
                      >
                        {question.solution}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderTechnologySection = (tech, questions) => (
    <Card key={tech} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
            {tech.charAt(0).toUpperCase() + tech.slice(1)} Questions ({questions.length})
          </Typography>
        </Box>
        {questions.map((question, index) => renderQuestionCard(question, index))}
      </CardContent>
    </Card>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
            Personalized Coding Questions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {jobTitle} at {jobCompany}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 0 }}>
        <Box>
          {/* Enhanced Summary Card */}
          <Card sx={{ mb: 3, bgcolor: '#f8f9fa', position: 'relative', overflow: 'visible' }}>
            {/* Gamification Badge */}
            {codingQuestions.gamification && (
              <Box sx={{ position: 'absolute', top: -10, right: 20 }}>
                <Tooltip title="Enhanced with AI & Gamification">
                  <Chip
                    icon={<SparklesIcon />}
                    label="Enhanced"
                    color="secondary"
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Tooltip>
              </Box>
            )}
            
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {total_questions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Questions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {estimated_time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Minutes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {technologies.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Technologies
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {experience_level}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Level
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary.main" fontWeight="bold">
                      {codingQuestions.gamification?.total_possible_xp || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max XP
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {(codingQuestions.diversity_score * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Diversity
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Enhanced Features Indicator */}
              {codingQuestions.algorithm_features && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {codingQuestions.algorithm_features.semantic_matching && (
                    <Tooltip title="Semantic Matching Enabled">
                      <Chip icon={<BrainIcon />} label="AI Matching" size="small" color="primary" variant="outlined" />
                    </Tooltip>
                  )}
                  {codingQuestions.algorithm_features.gamification && (
                    <Tooltip title="Gamification Enabled">
                      <Chip icon={<TrophyIcon />} label="Gamified" size="small" color="secondary" variant="outlined" />
                    </Tooltip>
                  )}
                  {codingQuestions.algorithm_features.feedback_optimization && (
                    <Tooltip title="Feedback Optimization">
                      <Chip icon={<TrendingUpIcon />} label="Optimized" size="small" color="success" variant="outlined" />
                    </Tooltip>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Difficulty Breakdown */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Difficulty Breakdown
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${difficulty_breakdown.easy} Easy`}
                  color="success"
                  variant="outlined"
                  icon={<CheckIcon />}
                />
                <Chip 
                  label={`${difficulty_breakdown.medium} Medium`}
                  color="warning"
                  variant="outlined"
                  icon={<WarningIcon />}
                />
                <Chip 
                  label={`${difficulty_breakdown.hard} Hard`}
                  color="error"
                  variant="outlined"
                  icon={<ErrorIcon />}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Technology Sections */}
          <Typography variant="h6" gutterBottom color="primary">
            Questions by Technology
          </Typography>
          
          {Object.keys(questions_by_technology).length > 0 ? (
            Object.entries(questions_by_technology).map(([tech, questions]) => 
              renderTechnologySection(tech, questions)
            )
          ) : (
            <Alert severity="info">
              <Typography variant="body2">
                No questions available for the selected technologies and experience level.
              </Typography>
            </Alert>
          )}

          {/* Tips */}
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Tips:</strong> Practice these questions to improve your coding skills. 
              Start with easier questions and work your way up. Don't forget to test your solutions!
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
      
      {/* Performance Tracking Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CodingQuestionsModal; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timer,
  Assignment,
  CheckCircle,
  Warning,
  Close,
  NavigateNext,
  NavigateBefore,
  Flag,
  Help
} from '@mui/icons-material';

const AssessmentInterface = ({
  open,
  onClose,
  jobTitle,
  companyName,
  applicationId,
  onComplete
}) => {
  // Assessment state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes in seconds
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  // Mock questions (this will be replaced with API call)
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'ai_generated',
      question: 'Based on your resume experience with React.js, explain the key differences between functional components and class components.',
      options: [
        'Functional components use hooks, class components use lifecycle methods',
        'Functional components are faster, class components are slower',
        'Functional components can\'t use state, class components can',
        'There are no significant differences'
      ],
      correctAnswer: 0,
      category: 'Frontend Development'
    },
    {
      id: 2,
      type: 'predefined',
      question: 'What is the primary purpose of the useEffect hook in React?',
      options: [
        'To manage component state',
        'To handle side effects in functional components',
        'To create custom hooks',
        'To optimize performance'
      ],
      correctAnswer: 1,
      category: 'React.js'
    },
    {
      id: 3,
      type: 'ai_generated',
      question: 'Given your experience with Python backend development, describe how you would implement a RESTful API endpoint for user authentication.',
      options: [
        'Use Django REST Framework with JWT tokens',
        'Create a simple function with basic authentication',
        'Use only Django forms for authentication',
        'Implement OAuth 2.0 from scratch'
      ],
      correctAnswer: 0,
      category: 'Backend Development'
    },
    {
      id: 4,
      type: 'predefined',
      question: 'What is the time complexity of searching in a binary search tree?',
      options: [
        'O(1)',
        'O(log n)',
        'O(n)',
        'O(n²)'
      ],
      correctAnswer: 1,
      category: 'Data Structures'
    },
    {
      id: 5,
      type: 'ai_generated',
      question: 'Based on your project experience, how would you approach implementing a real-time chat feature using WebSocket technology?',
      options: [
        'Use Django Channels with Redis as backend',
        'Implement with plain WebSocket API',
        'Use polling with HTTP requests',
        'Use server-sent events only'
      ],
      correctAnswer: 0,
      category: 'Real-time Communication'
    }
  ]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isStarted && timeRemaining > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, timeRemaining, isCompleted]);

  const handleStartAssessment = () => {
    setIsStarted(true);
  };

  const handleTimeUp = () => {
    setIsCompleted(true);
    // Auto-submit when time is up
    handleSubmitAssessment();
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach(question => {
        if (answers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Mock API call - replace with actual endpoint
      console.log('Submitting assessment:', {
        applicationId,
        answers,
        score,
        timeSpent: 20 * 60 - timeRemaining,
        flaggedQuestions: Array.from(flaggedQuestions)
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsCompleted(true);
      onComplete(score);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assignment sx={{ color: '#db0011', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
              Knowledge Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {jobTitle} • {companyName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {!isStarted ? (
          // Pre-assessment screen
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
              Ready to Start Your Assessment?
            </Typography>
            
            <Box sx={{ my: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Assessment Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Chip icon={<Timer />} label={`Duration: 20 minutes`} color="primary" />
                <Chip icon={<Assignment />} label={`${questions.length} questions`} color="secondary" />
                <Chip icon={<CheckCircle />} label="3 attempts allowed" color="info" />
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Instructions:</strong>
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Answer all questions within the time limit</li>
                <li>You can flag questions for review</li>
                <li>Navigate between questions using the controls</li>
                <li>Your score determines interview eligibility</li>
              </ul>
            </Alert>

            <Button
              variant="contained"
              size="large"
              onClick={handleStartAssessment}
              sx={{
                bgcolor: '#db0011',
                '&:hover': { bgcolor: '#b71c1c' },
                minWidth: 200
              }}
            >
              Start Assessment
            </Button>
          </Box>
        ) : (
          // Assessment interface
          <Box sx={{ display: 'flex', height: '70vh' }}>
            {/* Left sidebar - Progress and navigation */}
            <Box sx={{ 
              width: 280, 
              borderRight: '1px solid #e0e0e0',
              p: 2,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Timer */}
              <Box sx={{ mb: 3, p: 2, bgcolor: timeRemaining < 300 ? '#ffebee' : '#f5f5f5', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Timer sx={{ color: timeRemaining < 300 ? '#d32f2f' : '#666' }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: timeRemaining < 300 ? '#d32f2f' : '#333'
                  }}>
                    {formatTime(timeRemaining)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(timeRemaining / (20 * 60)) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: timeRemaining < 300 ? '#d32f2f' : '#db0011'
                    }
                  }}
                />
              </Box>

              {/* Progress */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Progress ({currentQuestionIndex + 1}/{questions.length})
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressPercentage()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {getAnsweredCount()} of {questions.length} questions answered
                </Typography>
              </Box>

              {/* Question navigation */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Questions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {questions.map((question, index) => (
                    <Tooltip key={question.id} title={`Question ${index + 1}`}>
                      <Chip
                        label={index + 1}
                        size="small"
                        onClick={() => setCurrentQuestionIndex(index)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: index === currentQuestionIndex ? '#db0011' : 
                                   answers[question.id] !== undefined ? '#4caf50' :
                                   flaggedQuestions.has(question.id) ? '#ff9800' : '#e0e0e0',
                          color: index === currentQuestionIndex ? 'white' : 
                                 answers[question.id] !== undefined ? 'white' : '#666',
                          '&:hover': {
                            bgcolor: index === currentQuestionIndex ? '#b71c1c' : '#f0f0f0'
                          }
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>

              {/* Navigation buttons */}
              <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  fullWidth
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  fullWidth
                >
                  Next
                </Button>
              </Box>
            </Box>

            {/* Main content - Question */}
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
              {currentQuestion && (
                <>
                  {/* Question header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </Typography>
                      <Chip 
                        label={currentQuestion.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Tooltip title="Flag for review">
                      <IconButton
                        onClick={() => handleFlagQuestion(currentQuestion.id)}
                        sx={{
                          color: flaggedQuestions.has(currentQuestion.id) ? '#ff9800' : '#666'
                        }}
                      >
                        <Flag />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Question content */}
                  <Box sx={{ flex: 1, mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {currentQuestion.question}
                    </Typography>

                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                      <FormLabel component="legend">Select your answer:</FormLabel>
                      <RadioGroup
                        value={answers[currentQuestion.id] !== undefined ? answers[currentQuestion.id] : ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                      >
                        {currentQuestion.options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={index}
                            control={<Radio />}
                            label={option}
                            sx={{
                              mb: 2,
                              p: 2,
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: '#f5f5f5'
                              },
                              '&.Mui-checked': {
                                borderColor: '#db0011',
                                bgcolor: '#fff5f5'
                              }
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {currentQuestion.type === 'ai_generated' ? '🤖 AI-Generated' : '📋 Pre-defined'} Question
                    </Typography>
                    
                    <Button
                      variant="contained"
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={getAnsweredCount() < questions.length}
                      sx={{
                        bgcolor: '#db0011',
                        '&:hover': { bgcolor: '#b71c1c' }
                      }}
                    >
                      Submit Assessment
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Confirm submit dialog */}
      <Dialog open={showConfirmSubmit} onClose={() => setShowConfirmSubmit(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your assessment? You cannot change your answers after submission.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              • Questions answered: {getAnsweredCount()}/{questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Time remaining: {formatTime(timeRemaining)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Flagged questions: {flaggedQuestions.size}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmSubmit(false)}>
            Review More
          </Button>
          <Button 
            onClick={() => {
              setShowConfirmSubmit(false);
              handleSubmitAssessment();
            }}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AssessmentInterface;

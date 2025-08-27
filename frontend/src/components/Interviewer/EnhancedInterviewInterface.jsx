import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Paper, Typography, Button, IconButton, TextField,
  Card, CardContent, Chip, Stack, Divider, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Accordion,
  AccordionSummary, AccordionDetails, LinearProgress, Rating
} from '@mui/material';
import {
  PlayArrow, Pause, CheckCircle, Close, Timer, Assessment,
  Chat, Add, Star, ExpandMore, Lightbulb
} from '@mui/icons-material';

const EnhancedInterviewInterface = ({ interviewId, onComplete, onClose }) => {
  const [interviewState, setInterviewState] = useState('not_started');
  const [questions, setQuestions] = useState([]);
  const [competencyScores, setCompetencyScores] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [expandedCompetency, setExpandedCompetency] = useState('python_basics');
  
  const timerRef = useRef(null);

  // Mock data matching your wireframe
  const mockInterviewData = {
    candidate: {
      name: "John Doe",
      role: "Python Developer",
      source: "JD #PD-102 + Resume Analysis",
      interviewRound: "Technical (Competency-Based)"
    },
    competencies: [
      {
        id: 'python_basics',
        title: 'Python Basics',
        questions: [
          {
            id: 1,
            text: "Explain the difference between a list and a tuple in Python. (Follow-up: When would you prefer one over the other?)",
            expectedFocus: "Mutability, performance, usage scenarios.",
            answered: false
          },
          {
            id: 2,
            text: "Write a Python snippet to reverse a string without using slicing.",
            expectedFocus: "Loops, built-in functions.",
            answered: false
          }
        ]
      },
      {
        id: 'functional_programming',
        title: 'Functional Programming',
        questions: [
          {
            id: 3,
            text: "Can you give an example of a higher-order function in Python from your past projects?",
            expectedFocus: "Application in real-world scenario.",
            answered: false
          },
          {
            id: 4,
            text: "Implement a custom map() function in Python.",
            expectedFocus: "Closures, iterables.",
            answered: false
          }
        ]
      },
      {
        id: 'exception_handling',
        title: 'Exception Handling',
        questions: [
          {
            id: 5,
            text: "Describe a time when you caught an unexpected exception in production. How did you debug and fix it?",
            expectedFocus: "STAR/CAR structure.",
            answered: false
          },
          {
            id: 6,
            text: "Write a Python function that handles file read errors gracefully.",
            expectedFocus: "try-except-finally usage.",
            answered: false
          }
        ]
      },
      {
        id: 'api_microservices',
        title: 'API & Microservices',
        questions: [
          {
            id: 7,
            text: "Given a REST API returning JSON, write Python code to fetch and parse the response.",
            expectedFocus: "requests library, JSON parsing.",
            answered: false
          },
          {
            id: 8,
            text: "Explain how you would handle authentication in an API-based microservice architecture.",
            expectedFocus: "JWT, OAuth2.",
            answered: false
          }
        ]
      }
    ]
  };

  useEffect(() => {
    initializeInterview();
    return () => cleanup();
  }, [interviewId]);

  useEffect(() => {
    if (interviewState === 'in_progress') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewState]);

  const initializeInterview = async () => {
    try {
      setLoading(true);
      setQuestions(mockInterviewData.competencies);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing interview:', error);
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startInterview = async () => {
    setInterviewState('in_progress');
    setDuration(0);
  };

  const pauseInterview = () => setInterviewState('paused');
  const resumeInterview = () => setInterviewState('in_progress');

  const completeInterview = async () => {
    setInterviewState('completed');
    if (onComplete) {
      onComplete({
        duration,
        competencyScores,
        notes,
        questions: questions.flatMap(comp => comp.questions).filter(q => q.answered)
      });
    }
  };

  const markQuestionAnswered = (competencyId, questionId) => {
    setQuestions(prev => prev.map(comp => 
      comp.id === competencyId 
        ? {
            ...comp,
            questions: comp.questions.map(q => 
              q.id === questionId ? { ...q, answered: true } : q
            )
          }
        : comp
    ));
  };

  const scoreCompetency = (competencyId, score) => {
    setCompetencyScores(prev => ({ ...prev, [competencyId]: score }));
  };

  const addFollowUpQuestion = (competencyId, questionId) => {
    const newFollowUp = {
      id: Date.now(),
      text: "Follow-up question based on candidate's response...",
      expectedFocus: "Additional probing based on initial answer.",
      answered: false
    };

    setQuestions(prev => prev.map(comp => 
      comp.id === competencyId 
        ? {
            ...comp,
            questions: comp.questions.map(q => 
              q.id === questionId 
                ? { ...q, followUpQuestions: [...(q.followUpQuestions || []), newFollowUp] }
                : q
            )
          }
        : comp
    ));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompetencyProgress = (competency) => {
    const totalQuestions = competency.questions.length;
    const answeredQuestions = competency.questions.filter(q => q.answered).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header - Candidate Info */}
      <Paper sx={{ p: 2, borderRadius: 0, borderBottom: '2px solid #1976d2' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {mockInterviewData.candidate.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {mockInterviewData.candidate.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Source: {mockInterviewData.candidate.source}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interview Round: {mockInterviewData.candidate.interviewRound}
            </Typography>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={1} alignItems="center">
              <Timer color="primary" />
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatTime(duration)}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={1}>
              <Button
                variant={interviewState === 'not_started' ? 'contained' : 'outlined'}
                startIcon={<PlayArrow />}
                onClick={startInterview}
                color="success"
                disabled={interviewState === 'in_progress'}
              >
                Start
              </Button>
              
              {interviewState === 'in_progress' && (
                <Button variant="outlined" startIcon={<Pause />} onClick={pauseInterview}>
                  Pause
                </Button>
              )}
              
              {interviewState === 'paused' && (
                <Button variant="contained" startIcon={<PlayArrow />} onClick={resumeInterview} color="primary">
                  Resume
                </Button>
              )}
              
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={completeInterview}
                color="success"
                disabled={interviewState === 'not_started'}
              >
                Complete
              </Button>
              
              <IconButton onClick={onClose} color="error">
                <Close />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Questions Panel */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Interview Questions by Competency
          </Typography>
          
          {questions.map((competency) => (
            <Accordion 
              key={competency.id}
              expanded={expandedCompetency === competency.id}
              onChange={() => setExpandedCompetency(expandedCompetency === competency.id ? null : competency.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Competency: {competency.title}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getCompetencyProgress(competency)}
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={`${competency.questions.filter(q => q.answered).length}/${competency.questions.length}`}
                      color="primary"
                      variant="outlined"
                    />
                    {competencyScores[competency.id] && (
                      <Chip 
                        label={`Score: ${competencyScores[competency.id]}/10`}
                        color="success"
                      />
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Stack spacing={2}>
                  {competency.questions.map((question) => (
                    <Card key={question.id} variant="outlined" sx={{ border: question.answered ? '2px solid #4caf50' : '1px solid #e0e0e0' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                            Q{question.id}: {question.text}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {question.answered && (
                              <Chip 
                                icon={<CheckCircle />}
                                label="Answered"
                                color="success"
                                size="small"
                              />
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1, mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                            Expected Answer Focus:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {question.expectedFocus}
                          </Typography>
                        </Box>
                        
                        {/* Interviewer Tools */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {!question.answered && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CheckCircle />}
                              onClick={() => markQuestionAnswered(competency.id, question.id)}
                            >
                              Mark Answered
                            </Button>
                          )}
                          
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Star />}
                            onClick={() => scoreCompetency(competency.id, Math.floor(Math.random() * 10) + 1)}
                          >
                            Score Competency
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => addFollowUpQuestion(competency.id, question.id)}
                          >
                            Add Follow-up Question
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Side Panel - Interviewer Tools */}
        <Box sx={{ width: 350, bgcolor: 'white', borderLeft: '1px solid #e0e0e0' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Interviewer Tools
            </Typography>
          </Box>
          
          {/* Quick Actions */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={1}>
              <Button fullWidth variant="outlined" startIcon={<Assessment />}>
                Competency Assessment
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Chat />}>
                Interview Notes
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Lightbulb />}>
                AI Suggestions
              </Button>
            </Stack>
          </Box>
          
          <Divider />
          
          {/* Competency Scores */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Competency Scores
            </Typography>
            <Stack spacing={2}>
              {questions.map((competency) => (
                <Box key={competency.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {competency.title}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {competencyScores[competency.id] || 0}/10
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(competencyScores[competency.id] || 0) * 10}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
          
          <Divider />
          
          {/* Interview Progress */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Interview Progress
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Questions Answered:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {questions.flatMap(comp => comp.questions).filter(q => q.answered).length}/
                  {questions.flatMap(comp => comp.questions).length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Competencies Scored:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Object.keys(competencyScores).length}/{questions.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Time Elapsed:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EnhancedInterviewInterface;

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Rating
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Save,
  Send,
  Chat,
  Assessment,
  VideoCall,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  Fullscreen,
  Close,
  Timer,
  CheckCircle,
  Warning,
  Star
} from '@mui/icons-material';
import VideoCallInterface from './VideoCallInterface';
import webrtcService from '../../services/webrtcService';

const LiveInterviewInterface = ({ interviewId, onComplete, onClose }) => {
  const [interviewState, setInterviewState] = useState('not_started'); // not_started, in_progress, paused, completed
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [competencyScores, setCompetencyScores] = useState({});
  const [notes, setNotes] = useState('');
  const [showVideo, setShowVideo] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  const timerRef = useRef(null);
  const roomId = `interview-${interviewId}`;

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
      
      // Load interview data
      const response = await fetch(`/api/interview/sessions/${interviewId}/`);
      const interviewData = await response.json();
      
      // Load questions
      const questionsResponse = await fetch(`/api/interview/sessions/${interviewId}/competency-questions/`);
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.questions || []);
      
      // Set up WebRTC message handling
      webrtcService.onMessage((message) => {
        setMessages(prev => [...prev, message]);
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing interview:', error);
      setError('Failed to initialize interview');
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    webrtcService.cleanup();
  };

  const startInterview = async () => {
    try {
      setInterviewState('in_progress');
      setDuration(0);
      
      // Start the interview session
      await fetch(`/api/interview/sessions/${interviewId}/start/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Interview started');
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const pauseInterview = () => {
    setInterviewState('paused');
  };

  const resumeInterview = () => {
    setInterviewState('in_progress');
  };

  const completeInterview = async () => {
    try {
      setInterviewState('completed');
      
      // End the interview session
      await fetch(`/api/interview/sessions/${interviewId}/end/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (onComplete) {
        onComplete({
          duration,
          competencyScores,
          notes,
          questions: questions.filter(q => q.answered)
        });
      }
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const markQuestionAnswered = async (questionId) => {
    try {
      await fetch(`/api/interview/sessions/${interviewId}/mark-answered/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId })
      });
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, answered: true } : q
      ));
    } catch (error) {
      console.error('Error marking question answered:', error);
    }
  };

  const saveCompetencyScore = async (competency, score) => {
    try {
      setCompetencyScores(prev => ({ ...prev, [competency]: score }));
      
      await fetch(`/api/interview/sessions/${interviewId}/score-competency/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competency, score })
      });
    } catch (error) {
      console.error('Error saving competency score:', error);
    }
  };

  const sendMessage = async (message) => {
    try {
      const sentMessage = await webrtcService.sendMessage(message);
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Typography variant="h6">
              Live Interview - {interviewId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {interviewState === 'in_progress' ? 'In Progress' : 
               interviewState === 'paused' ? 'Paused' : 
               interviewState === 'completed' ? 'Completed' : 'Not Started'}
            </Typography>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={1} alignItems="center">
              <Timer />
              <Typography variant="h6">
                {formatTime(duration)}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => setShowVideo(!showVideo)}
                color={showVideo ? 'primary' : 'default'}
              >
                <VideoCall />
              </IconButton>
              <IconButton
                onClick={() => setShowChat(!showChat)}
                color={showChat ? 'primary' : 'default'}
              >
                <Chat />
              </IconButton>
              <IconButton
                onClick={() => setShowAssessment(!showAssessment)}
                color={showAssessment ? 'primary' : 'default'}
              >
                <Assessment />
              </IconButton>
              <IconButton onClick={onClose} color="error">
                <Close />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Area */}
        {showVideo && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <VideoCallInterface
              roomId={roomId}
              onLeave={onClose}
              onChatToggle={() => setShowChat(!showChat)}
            />
          </Box>
        )}

        {/* Side Panel */}
        <Box sx={{ width: 400, display: 'flex', flexDirection: 'column' }}>
          {/* Interview Controls */}
          <Paper sx={{ p: 2, borderRadius: 0 }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              {interviewState === 'not_started' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={startInterview}
                  color="success"
                >
                  Start Interview
                </Button>
              )}
              
              {interviewState === 'in_progress' && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Pause />}
                    onClick={pauseInterview}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={completeInterview}
                    color="success"
                  >
                    Complete
                  </Button>
                </>
              )}
              
              {interviewState === 'paused' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={resumeInterview}
                  color="primary"
                >
                  Resume
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Questions Panel */}
          <Paper sx={{ flex: 1, borderRadius: 0, overflow: 'auto' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Interview Questions
              </Typography>
              
              <List>
                {questions.map((question, index) => (
                  <ListItem key={question.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: question.answered ? 'success.main' : 'grey.300' }}>
                        {question.answered ? <CheckCircle /> : index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={question.text}
                      secondary={question.competency}
                    />
                    {!question.answered && (
                      <Button
                        size="small"
                        onClick={() => markQuestionAnswered(question.id)}
                      >
                        Mark Answered
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Box>

        {/* Assessment Panel */}
        {showAssessment && (
          <Dialog
            open={showAssessment}
            onClose={() => setShowAssessment(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Competency Assessment</DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {['Problem Solving', 'Communication', 'Technical Skills', 'Collaboration', 'Leadership'].map((competency) => (
                  <Grid item xs={12} key={competency}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {competency}
                        </Typography>
                        <Rating
                          value={competencyScores[competency] || 0}
                          onChange={(event, newValue) => {
                            saveCompetencyScore(competency, newValue);
                          }}
                          max={10}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Score: {competencyScores[competency] || 0}/10
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Interview Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your interview notes here..."
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAssessment(false)}>Close</Button>
              <Button variant="contained" onClick={() => setShowAssessment(false)}>
                Save Assessment
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Chat Panel */}
        {showChat && (
          <Dialog
            open={showChat}
            onClose={() => setShowChat(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Interview Chat</DialogTitle>
            <DialogContent>
              <Box sx={{ height: 300, overflow: 'auto', mb: 2 }}>
                {messages.map((message, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {message.user_id} - {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                    <Typography variant="body2">
                      {message.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <TextField
                fullWidth
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    sendMessage(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowChat(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </Box>
  );
};

export default LiveInterviewInterface;

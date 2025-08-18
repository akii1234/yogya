import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Badge,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Send,
  Stop,
  PlayArrow,
  Pause,
  Refresh,
  Assessment,
  Psychology,
  Person,
  SmartToy,
  Timer,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Chat,
  RecordVoiceOver,
  AutoAwesome,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const LiveInterviewInterface = ({ 
  interviewId, 
  candidate, 
  jobDescription, 
  onInterviewComplete,
  onBack 
}) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [candidateResponse, setCandidateResponse] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState({
    communication: 0,
    technical: 0,
    problemSolving: 0,
    culturalFit: 0,
    overall: 0
  });

  // Refs
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Sample questions for demonstration
  const sampleQuestions = [
    {
      id: 1,
      text: "Can you walk me through a challenging project you've worked on recently?",
      type: "behavioral",
      competency: "problem_solving",
      aiPrompt: "Listen for STAR method, specific examples, measurable outcomes"
    },
    {
      id: 2,
      text: "How do you handle conflicts in a team environment?",
      type: "behavioral", 
      competency: "teamwork",
      aiPrompt: "Look for conflict resolution strategies, empathy, collaboration"
    },
    {
      id: 3,
      text: "Explain the concept of RESTful APIs and when you would use them.",
      type: "technical",
      competency: "technical_knowledge",
      aiPrompt: "Assess technical depth, practical application, communication clarity"
    }
  ];

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const handleStartRecording = () => {
    setIsRecording(true);
    setTimer(0);
    // In a real implementation, this would start audio/video recording
    console.log('Recording started');
  };

  // Stop recording
  const handleStopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    // In a real implementation, this would stop recording
    console.log('Recording stopped');
  };

  // Toggle pause
  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  // Ask next question
  const handleNextQuestion = () => {
    const nextQuestion = sampleQuestions[questionHistory.length];
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setQuestionHistory(prev => [...prev, {
        question: nextQuestion,
        response: candidateResponse,
        timestamp: new Date().toISOString()
      }]);
      setCandidateResponse('');
      setAiSuggestions([]);
    }
  };

  // AI analysis of response
  const analyzeResponse = async (response, question) => {
    if (!isAIEnabled) return;

    // Simulate AI analysis
    const suggestions = [
      "Ask for specific examples of the technology mentioned",
      "Probe deeper into the problem-solving approach",
      "Request metrics or quantifiable results",
      "Explore the candidate's learning process"
    ];

    setAiSuggestions(suggestions);
  };

  // Handle response submission
  const handleResponseSubmit = () => {
    if (candidateResponse.trim()) {
      analyzeResponse(candidateResponse, currentQuestion);
      setCandidateResponse('');
    }
  };

  // Complete interview
  const handleCompleteInterview = () => {
    setShowAssessmentDialog(true);
  };

  // Save assessment
  const handleSaveAssessment = () => {
    const interviewData = {
      interviewId,
      candidate,
      jobDescription,
      duration: timer,
      questions: questionHistory,
      assessment: currentAssessment,
      notes: interviewNotes,
      completedAt: new Date().toISOString()
    };

    console.log('Interview completed:', interviewData);
    onInterviewComplete(interviewData);
  };

  // Update assessment score
  const handleAssessmentChange = (category, value) => {
    setCurrentAssessment(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, bgcolor: '#db0011', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
              onClick={onBack}
            >
              ← Back
            </Button>
          </Grid>
          <Grid item xs>
            <Typography variant="h6">
              Live Interview: {candidate?.name || 'Candidate'} - {jobDescription?.title || 'Position'}
            </Typography>
          </Grid>
          <Grid item>
            <Chip
              icon={<Timer />}
              label={formatTime(timer)}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              <Tooltip title={isRecording ? 'Stop Recording' : 'Start Recording'}>
                <IconButton
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  sx={{ color: 'white' }}
                >
                  {isRecording ? <Stop /> : <Mic />}
                </IconButton>
              </Tooltip>
              <Tooltip title={isPaused ? 'Resume' : 'Pause'}>
                <IconButton
                  onClick={handleTogglePause}
                  disabled={!isRecording}
                  sx={{ color: 'white' }}
                >
                  {isPaused ? <PlayArrow /> : <Pause />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Video/Interview Area */}
        <Box sx={{ flex: 2, p: 2 }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Video Area */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: '#000', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Videocam sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6">Video Feed</Typography>
                <Typography variant="body2">Camera {isVideoOn ? 'On' : 'Off'}</Typography>
              </Box>
              
              {/* Recording indicator */}
              {isRecording && (
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'red',
                  borderRadius: '50%',
                  width: 12,
                  height: 12,
                  animation: 'pulse 1s infinite'
                }} />
              )}
            </Box>

            {/* Current Question */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Current Question:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentQuestion?.text || "Click 'Next Question' to begin the interview"}
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleNextQuestion}
                  disabled={questionHistory.length >= sampleQuestions.length}
                  startIcon={<PlayArrow />}
                >
                  Next Question
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowNotesDialog(true)}
                  startIcon={<Chat />}
                >
                  Add Notes
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - AI Assistant & Controls */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {/* AI Assistant */}
            <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmartToy sx={{ mr: 1, color: '#db0011' }} />
                <Typography variant="h6">AI Assistant</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAIEnabled}
                      onChange={(e) => setIsAIEnabled(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Enabled"
                  sx={{ ml: 'auto' }}
                />
              </Box>

              {isAIEnabled ? (
                <Box>
                  {aiSuggestions.length > 0 ? (
                    <List dense>
                      {aiSuggestions.map((suggestion, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#db0011', width: 24, height: 24 }}>
                              <AutoAwesome sx={{ fontSize: 14 }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={suggestion}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      AI will provide real-time suggestions based on candidate responses
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  AI assistant is disabled
                </Typography>
              )}
            </Paper>

            {/* Response Input */}
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Candidate Response
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                placeholder="Type candidate's response here..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleResponseSubmit}
                disabled={!candidateResponse.trim()}
                startIcon={<Send />}
                fullWidth
              >
                Submit Response
              </Button>
            </Paper>

            {/* Quick Actions */}
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assessment />}
                    onClick={() => setShowAssessmentDialog(true)}
                  >
                    Assessment
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Psychology />}
                    onClick={() => setShowNotesDialog(true)}
                  >
                    Notes
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    color="success"
                    onClick={handleCompleteInterview}
                    startIcon={<Stop />}
                  >
                    Complete Interview
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* Assessment Dialog */}
      <Dialog 
        open={showAssessmentDialog} 
        onClose={() => setShowAssessmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Interview Assessment</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Rate the candidate on different competencies:
              </Typography>
            </Grid>
            
            {Object.entries({
              communication: 'Communication Skills',
              technical: 'Technical Knowledge',
              problemSolving: 'Problem Solving',
              culturalFit: 'Cultural Fit',
              overall: 'Overall Assessment'
            }).map(([key, label]) => (
              <Grid item xs={12} key={key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ minWidth: 120 }}>
                    {label}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <IconButton
                        key={rating}
                        onClick={() => handleAssessmentChange(key, rating)}
                        size="small"
                      >
                        {currentAssessment[key] >= rating ? (
                          <Star sx={{ color: '#ffc107' }} />
                        ) : (
                          <StarBorder />
                        )}
                      </IconButton>
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ({currentAssessment[key]}/5)
                  </Typography>
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Interview Notes"
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Add detailed notes about the interview..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssessmentDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveAssessment}
            color="success"
          >
            Save & Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog 
        open={showNotesDialog} 
        onClose={() => setShowNotesDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Interview Notes</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Notes"
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
            placeholder="Add your interview notes here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotesDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setShowNotesDialog(false)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveInterviewInterface;

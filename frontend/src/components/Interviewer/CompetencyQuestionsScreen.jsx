import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Stack,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import competencyQuestionsService from '../../services/competencyQuestionsService';

const CompetencyQuestionsScreen = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [candidateResponse, setCandidateResponse] = useState('');
  const [interviewStatus, setInterviewStatus] = useState('preparing');
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreDialog, setScoreDialog] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState(null);
  const [competencyScore, setCompetencyScore] = useState(0);
  const [followUpDialog, setFollowUpDialog] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  // Load session data on component mount
  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await competencyQuestionsService.getCompetencyQuestionsScreen(sessionId);
      
      if (data.success) {
        setSession(data.session);
        setCompetencies(data.competencies || []);
        setInterviewStatus(data.session?.status || 'preparing');
        setOverallScore(data.session?.overall_score || 0);
      } else {
        setError(data.error || 'Failed to load session data');
      }
    } catch (err) {
      console.error('Error loading session data:', err);
      setError('Failed to load session data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Fallback data for when API is not available
  const getDefaultCompetencies = () => [
    {
      title: 'Loading...',
      weightage: 0,
      skills: [],
      questionTypes: [],
      questions: [],
      overallScore: 0
    }
  ];

  const getDefaultSession = () => ({
    id: sessionId || 'Loading...',
    candidate: { name: 'Loading...', email: '', resume: 'Loading...' },
    job: { title: 'Loading...', id: '', company: 'Loading...' },
    interviewType: 'Loading...',
    source: 'Loading...',
    aiEnabled: false,
    aiMode: 'manual'
  });

  const handleStartInterview = async () => {
    try {
      const response = await competencyQuestionsService.startInterview(sessionId);
      if (response.success) {
        setInterviewStatus('active');
        setSession(prev => ({ ...prev, status: 'active' }));
        // Set first question as current
        const firstCompetency = competencies[0];
        if (firstCompetency && firstCompetency.questions.length > 0) {
          setCurrentQuestion(firstCompetency.questions[0]);
        }
      } else {
        setError(response.error || 'Failed to start interview');
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      setError('Failed to start interview. Please try again.');
    }
  };

  const handleMarkAnswered = async (questionId) => {
    try {
      const response = await competencyQuestionsService.markQuestionAnswered(sessionId, questionId);
      if (response.success) {
        // Update local state
        setCompetencies(prev => prev.map(comp => ({
          ...comp,
          questions: comp.questions.map(q => 
            q.id === questionId ? { ...q, answered: true } : q
          )
        })));
      } else {
        setError(response.error || 'Failed to mark question as answered');
      }
    } catch (err) {
      console.error('Error marking question answered:', err);
      setError('Failed to mark question as answered. Please try again.');
    }
  };

  const handleScoreCompetency = (competency) => {
    setSelectedCompetency(competency);
    setScoreDialog(true);
  };

  const handleSaveScore = async () => {
    if (selectedCompetency && competencyScore >= 0) {
      try {
        const response = await competencyQuestionsService.scoreCompetency(
          sessionId, 
          selectedCompetency.title, 
          competencyScore
        );
        
        if (response.success) {
          // Update local state
          setCompetencies(prev => prev.map(comp => 
            comp.title === selectedCompetency.title 
              ? { ...comp, overallScore: competencyScore }
              : comp
          ));
          
          // Update overall score
          const progressResponse = await competencyQuestionsService.getInterviewProgress(sessionId);
          if (progressResponse.success) {
            setOverallScore(progressResponse.overall_score || 0);
          }
          
          setScoreDialog(false);
          setCompetencyScore(0);
          setSelectedCompetency(null);
        } else {
          setError(response.error || 'Failed to save score');
        }
      } catch (err) {
        console.error('Error saving score:', err);
        setError('Failed to save score. Please try again.');
      }
    }
  };

  const handleAddFollowUp = (questionId) => {
    setFollowUpDialog(true);
    setCurrentQuestion(competencies.flatMap(c => c.questions).find(q => q.id === questionId));
  };

  const handleSaveFollowUp = async () => {
    if (currentQuestion && followUpQuestion.trim()) {
      try {
        const response = await competencyQuestionsService.addFollowUpQuestion(
          sessionId,
          currentQuestion.id,
          followUpQuestion
        );
        
        if (response.success) {
          // Update local state
          setCompetencies(prev => prev.map(comp => ({
            ...comp,
            questions: comp.questions.map(q => 
              q.id === currentQuestion.id 
                ? { ...q, followUp: followUpQuestion }
                : q
            )
          })));
          
          setFollowUpDialog(false);
          setFollowUpQuestion('');
        } else {
          setError(response.error || 'Failed to add follow-up question');
        }
      } catch (err) {
        console.error('Error adding follow-up question:', err);
        setError('Failed to add follow-up question. Please try again.');
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'expert';
    if (score >= 60) return 'proficient';
    if (score >= 40) return 'intermediate';
    return 'beginner';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">Loading Competency Questions...</Typography>
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
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Competency Questions Screen
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Candidate: {session?.candidate.name} | Role: {session?.job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Source: {session?.source} | Round: {session?.interviewType}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} textAlign="right">
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Chip 
                label={`AI ${session?.aiEnabled ? 'Enabled' : 'Disabled'}`}
                color={session?.aiEnabled ? 'success' : 'default'}
                size="small"
              />
              <Chip 
                label={session?.aiMode === 'ai_assisted' ? 'AI Assisted' : 'Manual'}
                color="primary"
                size="small"
              />
              <Button
                variant={interviewStatus === 'active' ? 'outlined' : 'contained'}
                color={interviewStatus === 'active' ? 'error' : 'primary'}
                startIcon={interviewStatus === 'active' ? <StopIcon /> : <StartIcon />}
                onClick={handleStartInterview}
                disabled={interviewStatus === 'completed'}
              >
                {interviewStatus === 'active' ? 'End Interview' : 'Start Interview'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Interview Progress
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <LinearProgress 
              variant="determinate" 
              value={overallScore} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Grid>
          <Grid item xs={12} md={4} textAlign="right">
            <Typography variant="h6" color="primary">
              {overallScore.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Score
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Competencies Section */}
      <Box>
        {competencies.map((competency, index) => (
          <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    {competency.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Weightage: {competency.weightage}% | Skills: {competency.skills.join(', ')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={`${competency.overallScore}%`}
                    color={getScoreColor(competency.overallScore)}
                    size="small"
                  />
                  <Chip 
                    label={getScoreLabel(competency.overallScore)}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    size="small"
                    startIcon={<AssessmentIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreCompetency(competency);
                    }}
                  >
                    Score
                  </Button>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {competency.questions.map((question, qIndex) => (
                  <Card key={qIndex} sx={{ mb: 2, border: question.answered ? '2px solid #4caf50' : '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <QuestionIcon color="primary" sx={{ mt: 0.5 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            Q{qIndex + 1}: {question.text}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Chip 
                              label={question.type}
                              color={question.type === 'technical' ? 'primary' : 'secondary'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={question.answered ? 'Answered' : 'Pending'}
                              color={question.answered ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            <strong>Expected Answer Focus:</strong> {question.expectedFocus}
                          </Typography>

                          {question.followUp && (
                            <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                              <strong>Follow-up:</strong> {question.followUp}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              variant={question.answered ? "outlined" : "contained"}
                              startIcon={question.answered ? <CheckIcon /> : <CheckIcon />}
                              onClick={() => handleMarkAnswered(question.id)}
                              disabled={question.answered}
                            >
                              {question.answered ? 'Marked Answered' : 'Mark Answered'}
                            </Button>
                            
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddFollowUp(question.id)}
                            >
                              Add Follow-up
                            </Button>

                            {question.score && (
                              <Chip 
                                label={`Score: ${question.score}%`}
                                color={getScoreColor(question.score)}
                                size="small"
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Score Dialog */}
      <Dialog open={scoreDialog} onClose={() => setScoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Score Competency: {selectedCompetency?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Rate the candidate's performance in {selectedCompetency?.title}:
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Score (0-100)"
            value={competencyScore}
            onChange={(e) => setCompetencyScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {getScoreLabel(competencyScore)} level ({competencyScore}%)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoreDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveScore} variant="contained">Save Score</Button>
        </DialogActions>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={followUpDialog} onClose={() => setFollowUpDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Follow-up Question
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Current Question: {currentQuestion?.text}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Follow-up Question"
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFollowUpDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFollowUp} variant="contained">Add Follow-up</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetencyQuestionsScreen;

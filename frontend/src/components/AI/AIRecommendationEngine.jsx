import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Rating,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  TrendingUp,
  Assessment,
  Lightbulb,
  Star,
  CheckCircle,
  Warning,
  Info,
  Refresh,
  Download,
  Share
} from '@mui/icons-material';
import api from '../../services/api';

const AIRecommendationEngine = () => {
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

  // Load scheduled interviews for the current interviewer
  useEffect(() => {
    loadScheduledInterviews();
  }, []);

  const loadScheduledInterviews = async () => {
    try {
      setLoadingInterviews(true);
      
      // Mock data for demonstration
      const mockInterviews = [
        {
          id: 1,
          job_posting: {
            title: 'Senior Python Developer',
            company: 'BigTech',
            location: 'Bangalore, India',
            description: 'We are looking for a Senior Python Developer with 5+ years of experience in Django, Flask, and cloud technologies.'
          },
          candidate: {
            name: 'Rahul Sharma',
            experience_years: 6,
            resume_text: 'Experienced Python developer with expertise in Django, Flask, AWS, and microservices architecture.'
          },
          scheduled_time: '2024-01-15T10:00:00Z',
          status: 'scheduled'
        },
        {
          id: 2,
          job_posting: {
            title: 'Frontend React Developer',
            company: 'BigTech',
            location: 'Mumbai, India',
            description: 'Looking for a React developer with strong JavaScript skills and experience with modern frontend frameworks.'
          },
          candidate: {
            name: 'Priya Patel',
            experience_years: 3,
            resume_text: 'Frontend developer with React, TypeScript, and modern CSS experience. Passionate about user experience.'
          },
          scheduled_time: '2024-01-16T14:00:00Z',
          status: 'scheduled'
        },
        {
          id: 3,
          job_posting: {
            title: 'DevOps Engineer',
            company: 'BigTech',
            location: 'Hyderabad, India',
            description: 'DevOps engineer needed with Docker, Kubernetes, and AWS experience for cloud infrastructure management.'
          },
          candidate: {
            name: 'Amit Kumar',
            experience_years: 4,
            resume_text: 'DevOps professional with expertise in Docker, Kubernetes, AWS, CI/CD pipelines, and infrastructure automation.'
          },
          scheduled_time: '2024-01-17T11:00:00Z',
          status: 'scheduled'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setScheduledInterviews(mockInterviews);
        setLoadingInterviews(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error loading scheduled interviews:', err);
      setError('Failed to load scheduled interviews');
      setLoadingInterviews(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedInterview) {
      setError('Please select an interview first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock recommendations data for demonstration
      const mockRecommendations = {
        overall_score: 85,
        recommended_questions: [
          {
            text: "Can you walk me through a complex Django project you've built and explain the architecture decisions you made?",
            type: "technical",
            difficulty: "hard",
            confidence_score: 0.92
          },
          {
            text: "How would you handle a situation where your team disagrees with your technical approach?",
            type: "behavioral",
            difficulty: "medium",
            confidence_score: 0.88
          },
          {
            text: "Describe a time when you had to optimize database performance in a production environment.",
            type: "technical",
            difficulty: "hard",
            confidence_score: 0.85
          },
          {
            text: "What's your experience with microservices architecture and what challenges have you faced?",
            type: "technical",
            difficulty: "medium",
            confidence_score: 0.90
          },
          {
            text: "How do you stay updated with the latest Python frameworks and technologies?",
            type: "behavioral",
            difficulty: "easy",
            confidence_score: 0.78
          }
        ],
        insights: [
          "Candidate has strong Python and Django experience - focus on advanced architectural questions",
          "Good microservices background - explore system design and scalability",
          "Consider asking about team collaboration and leadership experience",
          "Database optimization experience is a strength - dive deeper into performance tuning"
        ]
      };

      // Simulate API delay
      setTimeout(() => {
        setRecommendations(mockRecommendations);
        setLoading(false);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate recommendations');
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'technical': return 'primary';
      case 'behavioral': return 'secondary';
      case 'situational': return 'info';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Psychology color="primary" />
        AI Recommendation Engine
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Generate intelligent question recommendations for your scheduled interviews.
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Scheduled Interviews Grid */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Scheduled Interviews
      </Typography>
      
      {loadingInterviews ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : scheduledInterviews.length === 0 ? (
        <Alert severity="info">
          No scheduled interviews found. Please wait for HR to schedule interviews for you.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {scheduledInterviews.map((interview) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={interview.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  border: selectedInterview?.id === interview.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  backgroundColor: selectedInterview?.id === interview.id ? '#f3f8ff' : 'transparent',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                    borderColor: 'primary.main'
                  }
                }}
                onClick={() => setSelectedInterview(interview)}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {interview.job_posting?.title || 'Unknown Job'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Company:</strong> {interview.job_posting?.company || 'Unknown'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Candidate:</strong> {interview.candidate?.name || 'Unknown'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Experience:</strong> {interview.candidate?.experience_years || 0} years
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Scheduled:</strong> {interview.scheduled_time ? new Date(interview.scheduled_time).toLocaleDateString() : 'TBD'}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Chip 
                      label={interview.status} 
                      size="small" 
                      color={interview.status === 'scheduled' ? 'primary' : 'default'}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Selected Interview Details */}
      {selectedInterview && (
        <Card sx={{ mb: 3, mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Interview Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Job: {selectedInterview.job_posting?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInterview.job_posting?.company} • {selectedInterview.job_posting?.location}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Candidate: {selectedInterview.candidate?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Experience: {selectedInterview.candidate?.experience_years || 'N/A'} years
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={generateRecommendations}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
              >
                Generate AI Recommendations
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedInterview(null);
                  setRecommendations(null);
                  setError(null);
                }}
              >
                Clear Selection
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={24} />
              <Typography>Generating AI recommendations...</Typography>
            </Box>
            <LinearProgress sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      )}

      {/* Recommendations Display */}
      {recommendations && !loading && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lightbulb color="primary" />
              AI Recommendations
            </Typography>

            {/* Overall Score */}
            {recommendations.overall_score && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Overall Recommendation Score
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Rating 
                    value={recommendations.overall_score / 20} 
                    max={5} 
                    precision={0.1} 
                    readOnly 
                  />
                  <Typography variant="h6" color="primary">
                    {recommendations.overall_score}%
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Question Recommendations */}
            {recommendations.recommended_questions && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    Recommended Questions ({recommendations.recommended_questions.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {recommendations.recommended_questions.map((question, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Assessment color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={question.text}
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                label={question.type} 
                                size="small" 
                                color={getQuestionTypeColor(question.type)}
                                sx={{ mr: 1 }}
                              />
                              <Chip 
                                label={question.difficulty} 
                                size="small" 
                                color={getDifficultyColor(question.difficulty)}
                              />
                              {question.confidence_score && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                  Confidence: {Math.round(question.confidence_score * 100)}%
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Insights */}
            {recommendations.insights && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    AI Insights
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {recommendations.insights.map((insight, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Info color="info" />
                        </ListItemIcon>
                        <ListItemText primary={insight} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={generateRecommendations}
              >
                Regenerate
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {
                  // TODO: Implement download functionality
                  console.log('Download recommendations');
                }}
              >
                Download
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={() => {
                  // TODO: Implement share functionality
                  console.log('Share recommendations');
                }}
              >
                Share
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AIRecommendationEngine; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Paper,
  Badge
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  Person,
  Work,
  AccessTime,
  CheckCircle,
  Warning,
  Error,
  PlayArrow,
  Info,
  CalendarToday,
  LocationOn,
  SmartToy,
  Psychology,
  Assessment,
  Timer,
  Mic,
  Videocam,
  Chat,
  Notifications,
  Star
} from '@mui/icons-material';
import candidateInterviewService from '../../services/candidateInterviewService';
const mockInterviews = [
  {
    id: '1',
    jobTitle: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    interviewer: {
      name: 'Sarah Johnson',
      role: 'Senior HR Manager',
      avatar: 'SJ'
    },
    scheduledDate: '2024-12-15T10:00:00Z',
    duration: 60,
    status: 'scheduled',
    type: 'technical',
    mode: 'video_call',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    instructions: [
      'Please join 5 minutes before the scheduled time',
      'Ensure your camera and microphone are working',
      'Have your portfolio and recent projects ready',
      'Prepare for technical questions and coding challenges'
    ],
    competencies: ['Problem Solving', 'Technical Skills', 'Communication', 'Teamwork'],
    isAIEnabled: true,
    aiMode: 'ai_assisted'
  },
  {
    id: '2',
    jobTitle: 'Data Scientist',
    company: 'InnovateTech',
    interviewer: {
      name: 'Michael Chen',
      role: 'Data Science Lead',
      avatar: 'MC'
    },
    scheduledDate: '2024-12-16T14:00:00Z',
    duration: 45,
    status: 'scheduled',
    type: 'behavioral',
    mode: 'video_call',
    meetingLink: 'https://zoom.us/j/123456789',
    instructions: [
      'Prepare STAR method responses for behavioral questions',
      'Have examples of your past projects ready',
      'Be ready to discuss your problem-solving approach',
      'Questions will focus on collaboration and leadership'
    ],
    competencies: ['Communication', 'Leadership', 'Problem Solving', 'Collaboration'],
    isAIEnabled: true,
    aiMode: 'ai_co_pilot'
  },
  {
    id: '3',
    jobTitle: 'Frontend Developer',
    company: 'StartUpHub',
    interviewer: {
      name: 'Emily Davis',
      role: 'Frontend Team Lead',
      avatar: 'ED'
    },
    scheduledDate: '2024-12-14T09:00:00Z',
    duration: 60,
    status: 'completed',
    type: 'technical',
    mode: 'video_call',
    meetingLink: 'https://meet.google.com/xyz-uvw-rst',
    instructions: [
      'Technical interview focusing on React and JavaScript',
      'Be prepared for live coding challenges',
      'Have your development environment ready',
      'Questions will cover frontend architecture and best practices'
    ],
    competencies: ['Technical Skills', 'Problem Solving', 'Code Quality', 'Architecture'],
    isAIEnabled: true,
    aiMode: 'ai_assisted',
    feedback: {
      overall: 4,
      technical: 4,
      communication: 5,
      problemSolving: 4,
      notes: 'Excellent technical skills and communication. Strong problem-solving approach.'
    }
  }
];

const InterviewManager = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading interviews for candidate...');
      
      const response = await candidateInterviewService.getMyInterviews();
      
      if (response.success) {
        setInterviews(response.interviews || mockInterviews);
        console.log('✅ Interviews loaded:', response.interviews);
      } else {
        console.warn('Failed to load interviews from API, using mock data');
        setInterviews(mockInterviews);
      }
    } catch (error) {
      console.error('❌ Error loading interviews:', error);
      console.warn('Using mock data as fallback');
      setInterviews(mockInterviews);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'rescheduled': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Schedule />;
      case 'in_progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Error />;
      case 'rescheduled': return <Warning />;
      default: return <Schedule />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'technical': return 'Technical Interview';
      case 'behavioral': return 'Behavioral Interview';
      case 'mixed': return 'Mixed Interview';
      case 'final': return 'Final Round';
      default: return 'Interview';
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'video_call': return 'Video Call';
      case 'phone_call': return 'Phone Call';
      case 'in_person': return 'In Person';
      case 'ai_only': return 'AI Interview';
      default: return 'Interview';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isInterviewUpcoming = (interview) => {
    const now = new Date();
    const interviewTime = new Date(interview.scheduledDate);
    const timeDiff = interviewTime - now;
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours
  };

  const canJoinInterview = (interview) => {
    const now = new Date();
    const interviewTime = new Date(interview.scheduledDate);
    const timeDiff = interviewTime - now;
    return timeDiff >= -15 * 60 * 1000 && timeDiff <= 60 * 60 * 1000; // 15 min before to 1 hour after
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setDetailDialogOpen(true);
  };

  const handleJoinInterview = (interview) => {
    setSelectedInterview(interview);
    setJoinDialogOpen(true);
  };

  const handleStartInterview = async () => {
    try {
      console.log('🚀 Joining interview:', selectedInterview.id);
      
      // Call API to join interview
      const response = await candidateInterviewService.joinInterview(selectedInterview.id);
      
      if (response.success) {
        // Open meeting link
        window.open(selectedInterview.meetingLink, '_blank');
        setJoinDialogOpen(false);
      } else {
        setError(response.error || 'Failed to join interview');
      }
    } catch (error) {
      console.error('Error joining interview:', error);
      setError('Failed to join interview. Please try again.');
    }
  };

  const handleReschedule = async (interviewId) => {
    try {
      console.log('📅 Rescheduling interview:', interviewId);
      
      const response = await candidateInterviewService.rescheduleInterview(interviewId);
      
      if (response.success) {
        // Reload interviews to get updated data
        await loadInterviews();
      } else {
        setError(response.error || 'Failed to reschedule interview');
      }
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      setError('Failed to reschedule interview. Please try again.');
    }
  };

  const handleCancel = async (interviewId) => {
    try {
      console.log('❌ Cancelling interview:', interviewId);
      
      const response = await candidateInterviewService.cancelInterview(interviewId);
      
      if (response.success) {
        // Reload interviews to get updated data
        await loadInterviews();
      } else {
        setError(response.error || 'Failed to cancel interview');
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      setError('Failed to cancel interview. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Interviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and join your scheduled interviews
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upcoming Interviews */}
      {interviews.filter(i => i.status === 'scheduled' && isInterviewUpcoming(i)).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#db0011', fontWeight: 600 }}>
            ⚠️ Upcoming Interviews (Next 24 Hours)
          </Typography>
          <Grid container spacing={2}>
            {interviews
              .filter(i => i.status === 'scheduled' && isInterviewUpcoming(i))
              .map((interview) => (
                <Grid item xs={12} key={interview.id}>
                  <Card sx={{ border: '2px solid #db0011', bgcolor: '#fff5f5' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {interview.jobTitle} at {interview.company}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formatDate(interview.scheduledDate)} • {interview.duration} minutes
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              icon={<VideoCall />} 
                              label={getModeLabel(interview.mode)} 
                              size="small" 
                              color="primary" 
                            />
                            <Chip 
                              icon={<SmartToy />} 
                              label={interview.aiMode === 'ai_assisted' ? 'AI Assisted' : 'AI Co-Pilot'} 
                              size="small" 
                              color="secondary" 
                            />
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<VideoCall />}
                            onClick={() => handleJoinInterview(interview)}
                            disabled={!canJoinInterview(interview)}
                          >
                            Join Now
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleViewDetails(interview)}
                          >
                            Details
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {/* All Interviews */}
      <Typography variant="h6" gutterBottom>
        All Interviews
      </Typography>

      <Grid container spacing={3}>
        {interviews.map((interview) => (
          <Grid item xs={12} md={6} lg={4} key={interview.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#db0011', mr: 2 }}>
                    {interview.interviewer.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {interview.interviewer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interview.interviewer.role}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(interview.status)}
                    label={interview.status.replace('_', ' ')}
                    color={getStatusColor(interview.status)}
                    size="small"
                  />
                </Box>

                {/* Job Info */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {interview.jobTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {interview.company}
                </Typography>

                {/* Interview Details */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(interview.scheduledDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(interview.scheduledDate)} • {interview.duration} min
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {getTypeLabel(interview.type)}
                    </Typography>
                  </Box>
                </Box>

                {/* AI Mode */}
                {interview.isAIEnabled && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<SmartToy />}
                      label={`AI ${interview.aiMode === 'ai_assisted' ? 'Assisted' : 'Co-Pilot'}`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                )}

                {/* Competencies */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Focus Areas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {interview.competencies.slice(0, 3).map((comp, index) => (
                      <Chip
                        key={index}
                        label={comp}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {interview.competencies.length > 3 && (
                      <Chip
                        label={`+${interview.competencies.length - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Actions */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {interview.status === 'scheduled' && canJoinInterview(interview) && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<VideoCall />}
                      onClick={() => handleJoinInterview(interview)}
                      fullWidth
                    >
                      Join Interview
                    </Button>
                  )}
                  {interview.status === 'scheduled' && !canJoinInterview(interview) && (
                    <Button
                      variant="outlined"
                      onClick={() => handleViewDetails(interview)}
                      fullWidth
                    >
                      View Details
                    </Button>
                  )}
                  {interview.status === 'completed' && (
                    <Button
                      variant="outlined"
                      onClick={() => handleViewDetails(interview)}
                      fullWidth
                    >
                      View Results
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Interview Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Interview Details - {selectedInterview?.jobTitle}
        </DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <Box>
              <Grid container spacing={3}>
                {/* Interview Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Interview Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Position:</strong> {selectedInterview.jobTitle}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Company:</strong> {selectedInterview.company}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Date & Time:</strong> {formatDate(selectedInterview.scheduledDate)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Duration:</strong> {selectedInterview.duration} minutes
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Type:</strong> {getTypeLabel(selectedInterview.type)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Mode:</strong> {getModeLabel(selectedInterview.mode)}
                    </Typography>
                  </Box>
                </Grid>

                {/* Interviewer Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Interviewer</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#db0011', mr: 2, width: 56, height: 56 }}>
                      {selectedInterview.interviewer.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {selectedInterview.interviewer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInterview.interviewer.role}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedInterview.isAIEnabled && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>AI Assistant</Typography>
                      <Chip
                        icon={<SmartToy />}
                        label={`AI ${selectedInterview.aiMode === 'ai_assisted' ? 'Assisted' : 'Co-Pilot'}`}
                        color="secondary"
                      />
                    </Box>
                  )}
                </Grid>

                {/* Competencies */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Focus Areas</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedInterview.competencies.map((comp, index) => (
                      <Chip
                        key={index}
                        label={comp}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Instructions */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Interview Instructions</Typography>
                  <List dense>
                    {selectedInterview.instructions.map((instruction, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={instruction}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                {/* Feedback (if completed) */}
                {selectedInterview.status === 'completed' && selectedInterview.feedback && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Interview Feedback</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <Grid container spacing={2}>
                        {Object.entries({
                          overall: 'Overall',
                          technical: 'Technical Skills',
                          communication: 'Communication',
                          problemSolving: 'Problem Solving'
                        }).map(([key, label]) => (
                          <Grid item xs={6} key={key}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{label}:</Typography>
                              <Box sx={{ display: 'flex' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    sx={{
                                      color: selectedInterview.feedback[key] >= star ? '#ffc107' : '#e0e0e0',
                                      fontSize: 16
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      {selectedInterview.feedback.notes && (
                        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                          "{selectedInterview.feedback.notes}"
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedInterview?.status === 'scheduled' && canJoinInterview(selectedInterview) && (
            <Button
              variant="contained"
              color="success"
              startIcon={<VideoCall />}
              onClick={() => {
                setDetailDialogOpen(false);
                handleJoinInterview(selectedInterview);
              }}
            >
              Join Interview
            </Button>
          )}
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Interview Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Join Interview - {selectedInterview?.jobTitle}
        </DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  You're about to join your interview with {selectedInterview.interviewer.name} from {selectedInterview.company}.
                </Typography>
              </Alert>

              <Typography variant="h6" gutterBottom>Interview Details</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Time:</strong> {formatTime(selectedInterview.scheduledDate)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Duration:</strong> {selectedInterview.duration} minutes
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Type:</strong> {getTypeLabel(selectedInterview.type)}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>Meeting Link</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedInterview.meetingLink}
              </Typography>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Please ensure your camera and microphone are working before joining.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<VideoCall />}
            onClick={handleStartInterview}
          >
            Join Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewManager;

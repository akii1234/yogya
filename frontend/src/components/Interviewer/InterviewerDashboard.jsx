import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Stack,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import interviewerService from '../../services/interviewerService';

const InterviewerDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    upcomingInterviews: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for development
  const mockInterviews = [
    {
      id: 'INT-001',
      candidate: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: null
      },
      job: {
        title: 'Python Developer',
        company: 'Innovation Labs'
      },
      scheduledAt: '2024-01-15T10:00:00Z',
      status: 'scheduled',
      type: 'Technical',
      duration: 60,
      aiEnabled: true
    },
    {
      id: 'INT-002',
      candidate: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        avatar: null
      },
      job: {
        title: 'Frontend Developer',
        company: 'TechCorp'
      },
      scheduledAt: '2024-01-16T14:00:00Z',
      status: 'completed',
      type: 'Behavioral',
      duration: 45,
      aiEnabled: true,
      score: 85
    },
    {
      id: 'INT-003',
      candidate: {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        avatar: null
      },
      job: {
        title: 'Data Scientist',
        company: 'Analytics Inc'
      },
      scheduledAt: '2024-01-17T09:00:00Z',
      status: 'scheduled',
      type: 'Technical',
      duration: 90,
      aiEnabled: false
    }
  ];

  const mockStats = {
    totalInterviews: 25,
    completedInterviews: 18,
    upcomingInterviews: 7,
    averageScore: 82.5
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load interviews and analytics in parallel
      const [interviewsData, analyticsData] = await Promise.all([
        interviewerService.getInterviews().catch(err => {
          console.warn('Failed to load interviews:', err);
          return { interviews: mockInterviews };
        }),
        interviewerService.getInterviewAnalytics().catch(err => {
          console.warn('Failed to load analytics:', err);
          return { stats: mockStats };
        })
      ]);
      
      setInterviews(interviewsData.interviews || mockInterviews);
      setStats(analyticsData.stats || mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      setInterviews(mockInterviews);
      setStats(mockStats);
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
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Technical': return 'error';
      case 'Behavioral': return 'info';
      case 'System Design': return 'warning';
      default: return 'default';
    }
  };

  const handleStartInterview = (interviewId) => {
    // Navigate to competency questions screen
    window.location.href = `/interviewer/interviews/${interviewId}/competency-questions`;
  };

  const handleViewInterview = (interviewId) => {
    // Navigate to interview details
    window.location.href = `/interviewer/interviews/${interviewId}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6">Loading Interviewer Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h4" gutterBottom>
          Interviewer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's your interview schedule and performance overview.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Interviews
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalInterviews}
                  </Typography>
                </Box>
                <ScheduleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {stats.completedInterviews}
                  </Typography>
                </Box>
                <AssessmentIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming
                  </Typography>
                  <Typography variant="h4">
                    {stats.upcomingInterviews}
                  </Typography>
                </Box>
                <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Score
                  </Typography>
                  <Typography variant="h4">
                    {stats.averageScore}%
                  </Typography>
                </Box>
                <PsychologyIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Interviews */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Upcoming Interviews
          </Typography>
          <IconButton>
            <RefreshIcon />
          </IconButton>
        </Box>

        {interviews.filter(i => i.status === 'scheduled').length === 0 ? (
          <Alert severity="info">
            No upcoming interviews scheduled. Check back later!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {interviews
              .filter(interview => interview.status === 'scheduled')
              .map((interview) => (
                <Grid item xs={12} md={6} key={interview.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="h6">
                            {interview.candidate.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {interview.candidate.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" gutterBottom>
                        {interview.job.title} at {interview.job.company}
                      </Typography>

                      <Stack direction="row" spacing={1} mb={2}>
                        <Chip 
                          label={interview.type} 
                          color={getTypeColor(interview.type)}
                          size="small"
                        />
                        <Chip 
                          label={interview.status} 
                          color={getStatusColor(interview.status)}
                          size="small"
                        />
                        {interview.aiEnabled && (
                          <Chip 
                            label="AI Enabled" 
                            color="success"
                            size="small"
                          />
                        )}
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        Scheduled: {new Date(interview.scheduledAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {interview.duration} minutes
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<StartIcon />}
                        onClick={() => handleStartInterview(interview.id)}
                      >
                        Start Interview
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewInterview(interview.id)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Paper>

      {/* Recent Completed Interviews */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Completed Interviews
        </Typography>

        {interviews.filter(i => i.status === 'completed').length === 0 ? (
          <Alert severity="info">
            No completed interviews yet.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {interviews
              .filter(interview => interview.status === 'completed')
              .slice(0, 4)
              .map((interview) => (
                <Grid item xs={12} md={6} key={interview.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="h6">
                            {interview.candidate.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {interview.job.title} at {interview.job.company}
                          </Typography>
                        </Box>
                        {interview.score && (
                          <Chip 
                            label={`${interview.score}%`}
                            color={interview.score >= 80 ? 'success' : interview.score >= 60 ? 'warning' : 'error'}
                          />
                        )}
                      </Box>

                      <Stack direction="row" spacing={1} mb={2}>
                        <Chip 
                          label={interview.type} 
                          color={getTypeColor(interview.type)}
                          size="small"
                        />
                        <Chip 
                          label="Completed" 
                          color="success"
                          size="small"
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        Completed: {new Date(interview.scheduledAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewInterview(interview.id)}
                      >
                        View Report
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default InterviewerDashboard;

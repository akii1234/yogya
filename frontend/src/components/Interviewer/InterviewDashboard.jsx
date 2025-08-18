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
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Schedule,
  Person,
  Work,
  TrendingUp,
  Psychology,
  SmartToy,
  PlayArrow,
  Stop,
  Edit,
  Visibility,
  Assessment,
  Settings,
  Notifications,
  CalendarToday,
  AccessTime,
  CheckCircle,
  Warning,
  Error,
  Add,
  VideoCall
} from '@mui/icons-material';
import LiveInterviewInterface from './LiveInterviewInterface';

// Mock data for development
const mockInterviews = [
  {
    id: '1',
    candidate: {
      name: 'Anupam Sharma',
      email: 'anupam.sharma@email.com',
      avatar: 'AS'
    },
    job: {
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions'
    },
    scheduledDate: '2024-12-15T10:00:00Z',
    duration: 60,
    status: 'scheduled',
    aiMode: 'ai_assisted',
    competencyFramework: 'Python Developer',
    isLive: false
  },
  {
    id: '2',
    candidate: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      avatar: 'SJ'
    },
    job: {
      title: 'Data Scientist',
      company: 'InnovateTech'
    },
    scheduledDate: '2024-12-15T14:00:00Z',
    duration: 45,
    status: 'ai_prep',
    aiMode: 'ai_co_pilot',
    competencyFramework: 'Data Science',
    isLive: false
  },
  {
    id: '3',
    candidate: {
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      avatar: 'MC'
    },
    job: {
      title: 'Frontend Developer',
      company: 'StartUpHub'
    },
    scheduledDate: '2024-12-16T09:00:00Z',
    duration: 60,
    status: 'completed',
    aiMode: 'ai_assisted',
    competencyFramework: 'React Developer',
    isLive: false
  }
];

const mockAnalytics = {
  totalInterviews: 45,
  completedInterviews: 38,
  aiAssistedInterviews: 32,
  averageScore: 7.8,
  completionRate: 84.4,
  aiUsageRate: 71.1,
  recentPerformance: [
    { date: '2024-12-10', score: 8.2 },
    { date: '2024-12-11', score: 7.9 },
    { date: '2024-12-12', score: 8.1 },
    { date: '2024-12-13', score: 7.7 },
    { date: '2024-12-14', score: 8.0 }
  ]
};

const InterviewDashboard = () => {
  const [interviews, setInterviews] = useState(mockInterviews);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [liveInterview, setLiveInterview] = useState(null);
  const [showLiveInterface, setShowLiveInterface] = useState(false);

  useEffect(() => {
    // TODO: Fetch real data from API
    console.log('🎯 Interview Dashboard loaded');
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'ai_prep': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Schedule />;
      case 'ai_prep': return <SmartToy />;
      case 'in_progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Error />;
      default: return <Schedule />;
    }
  };

  const getAIModeLabel = (mode) => {
    switch (mode) {
      case 'human_only': return 'Human Only';
      case 'ai_assisted': return 'AI Assisted';
      case 'ai_co_pilot': return 'AI Co-Pilot';
      case 'ai_lead': return 'AI Lead';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartInterview = (interviewId) => {
    console.log('🚀 Starting interview:', interviewId);
    const interview = interviews.find(i => i.id === interviewId);
    if (interview) {
      setLiveInterview(interview);
      setShowLiveInterface(true);
    }
  };

  const handleViewInterview = (interviewId) => {
    console.log('👁️ Viewing interview:', interviewId);
    // TODO: Navigate to interview details
  };

  const handlePrepareInterview = (interviewId) => {
    console.log('🤖 Preparing interview with AI:', interviewId);
    // TODO: Call AI preparation API
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleInterviewComplete = (interviewData) => {
    console.log('✅ Interview completed:', interviewData);
    // TODO: Save interview data to backend
    setShowLiveInterface(false);
    setLiveInterview(null);
    
    // Update interview status in the list
    setInterviews(prev => prev.map(interview => 
      interview.id === liveInterview.id 
        ? { ...interview, status: 'completed' }
        : interview
    ));
  };

  const handleBackToDashboard = () => {
    setShowLiveInterface(false);
    setLiveInterview(null);
  };

  // Show live interview interface if active
  if (showLiveInterface && liveInterview) {
    return (
      <LiveInterviewInterface
        interviewId={liveInterview.id}
        candidate={liveInterview.candidate}
        jobDescription={liveInterview.job}
        onInterviewComplete={handleInterviewComplete}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Interview Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your interviews with AI assistance
        </Typography>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Interviews
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.totalInterviews}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Assessment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.completionRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    AI Usage Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.aiUsageRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <SmartToy />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Score
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analytics.averageScore}/10
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Interviews List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Upcoming Interviews
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => console.log('➕ Create new interview')}
                >
                  Schedule Interview
                </Button>
              </Box>

              <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Scheduled" />
                <Tab label="In Progress" />
                <Tab label="Completed" />
              </Tabs>

              <List>
                {interviews.map((interview, index) => (
                  <React.Fragment key={interview.id}>
                    <ListItem
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={interview.isLive ? 'LIVE' : ''}
                          color="error"
                        >
                          <Avatar>{interview.candidate.avatar}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {interview.candidate.name}
                            </Typography>
                            <Chip
                              label={getAIModeLabel(interview.aiMode)}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {interview.job.title} at {interview.job.company}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday fontSize="small" />
                                <Typography variant="caption">
                                  {formatDate(interview.scheduledDate)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime fontSize="small" />
                                <Typography variant="caption">
                                  {interview.duration} min
                                </Typography>
                              </Box>
                              <Chip
                                icon={getStatusIcon(interview.status)}
                                label={interview.status.replace('_', ' ')}
                                size="small"
                                color={getStatusColor(interview.status)}
                              />
                            </Box>
                          </Box>
                        }
                      />

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {interview.status === 'scheduled' && (
                          <Tooltip title="Prepare with AI">
                            <IconButton
                              size="small"
                              onClick={() => handlePrepareInterview(interview.id)}
                              color="info"
                            >
                              <SmartToy />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {interview.status === 'ai_prep' && (
                          <Tooltip title="Start Interview">
                            <IconButton
                              size="small"
                              onClick={() => handleStartInterview(interview.id)}
                              color="success"
                            >
                              <VideoCall />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {interview.status === 'completed' && (
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewInterview(interview.id)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Edit">
                          <IconButton size="small" color="default">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < interviews.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SmartToy />}
                  fullWidth
                  onClick={() => console.log('🤖 AI Assistant Settings')}
                >
                  AI Assistant Settings
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                  onClick={() => console.log('📊 View Analytics')}
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  fullWidth
                  onClick={() => console.log('⚙️ Interviewer Settings')}
                >
                  Interviewer Settings
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Interview completed"
                    secondary="Anupam Sharma - Senior Developer"
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    2 hours ago
                  </Typography>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="AI preparation completed"
                    secondary="Sarah Johnson - Data Scientist"
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    4 hours ago
                  </Typography>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Interview scheduled"
                    secondary="Michael Chen - Frontend Developer"
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    1 day ago
                  </Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default InterviewDashboard; 
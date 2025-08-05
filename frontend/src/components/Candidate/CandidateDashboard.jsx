import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  Work,
  TrendingUp,
  Notifications,
  CheckCircle,
  Schedule,
  Warning,
  Person
} from '@mui/icons-material';

const CandidateDashboard = () => {
  const stats = [
    {
      title: 'Applications',
      value: '8',
      icon: <Work />,
      color: 'primary',
      change: '+2 this week'
    },
    {
      title: 'Interviews',
      value: '3',
      icon: <Schedule />,
      color: 'secondary',
      change: '+1 this week'
    },
    {
      title: 'Profile Views',
      value: '24',
      icon: <Person />,
      color: 'success',
      change: '+5 today'
    },
    {
      title: 'Response Rate',
      value: '75%',
      icon: <TrendingUp />,
      color: 'warning',
      change: '+10% this month'
    }
  ];

  const recentApplications = [
    {
      id: 1,
      company: 'TechCorp',
      position: 'Senior Python Developer',
      status: 'Applied',
      date: '2024-01-15',
      progress: 100
    },
    {
      id: 2,
      company: 'StartupXYZ',
      position: 'React Frontend Developer',
      status: 'Interview Scheduled',
      date: '2024-01-12',
      progress: 75
    },
    {
      id: 3,
      company: 'Enterprise Inc',
      position: 'DevOps Engineer',
      status: 'Under Review',
      date: '2024-01-10',
      progress: 50
    }
  ];

  const notifications = [
    {
      id: 1,
      message: 'Interview scheduled for TechCorp - Senior Python Developer',
      time: '2 hours ago',
      type: 'interview'
    },
    {
      id: 2,
      message: 'Your profile was viewed by 3 companies',
      time: '1 day ago',
      type: 'profile'
    },
    {
      id: 3,
      message: 'New job matches found for your skills',
      time: '2 days ago',
      type: 'job'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'info';
      case 'Interview Scheduled': return 'success';
      case 'Under Review': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied': return <CheckCircle />;
      case 'Interview Scheduled': return <Schedule />;
      case 'Under Review': return <Warning />;
      case 'Rejected': return <Warning />;
      default: return <CheckCircle />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Dashboard color="primary" />
        Candidate Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: `${stat.color}.light`, 
                    color: `${stat.color}.main`,
                    mr: 2
                  }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Applications */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Applications
              </Typography>
              <List>
                {recentApplications.map((application) => (
                  <ListItem key={application.id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {application.company.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={application.position}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {application.company} • {application.date}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip 
                              label={application.status} 
                              size="small" 
                              color={getStatusColor(application.status)}
                              icon={getStatusIcon(application.status)}
                            />
                            <LinearProgress 
                              variant="determinate" 
                              value={application.progress} 
                              sx={{ flexGrow: 1, ml: 2 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {application.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" fullWidth>
                  View All Applications
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications />
                Notifications
              </Typography>
              <List>
                {notifications.map((notification) => (
                  <ListItem key={notification.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={notification.message}
                      secondary={notification.time}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Button variant="text" size="small" fullWidth>
                  View All Notifications
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="contained" fullWidth startIcon={<Work />}>
                Browse Jobs
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth startIcon={<Person />}>
                Update Profile
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth startIcon={<TrendingUp />}>
                View Analytics
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth startIcon={<Notifications />}>
                Settings
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CandidateDashboard; 
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Dashboard,
  Work,
  People,
  TrendingUp,
  Psychology,
  AutoAwesome
} from '@mui/icons-material';

const DashboardOverview = () => {
  const stats = [
    {
      title: 'Active Jobs',
      value: '12',
      icon: <Work />,
      color: 'primary',
      change: '+2 this week'
    },
    {
      title: 'Total Candidates',
      value: '156',
      icon: <People />,
      color: 'secondary',
      change: '+23 this month'
    },
    {
      title: 'AI Recommendations',
      value: '89',
      icon: <Psychology />,
      color: 'success',
      change: '+15 today'
    },
    {
      title: 'LLM Questions',
      value: '27',
      icon: <AutoAwesome />,
      color: 'warning',
      change: '+3 generated'
    }
  ];

  const recentActivities = [
    { action: 'New job posted', time: '2 hours ago', type: 'job' },
    { action: 'Candidate applied', time: '4 hours ago', type: 'candidate' },
    { action: 'AI recommendation generated', time: '6 hours ago', type: 'ai' },
    { action: 'LLM questions created', time: '1 day ago', type: 'llm' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Dashboard color="primary" />
        HR Dashboard
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

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Work />}
                    sx={{ mb: 1 }}
                  >
                    Post Job
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<People />}
                    sx={{ mb: 1 }}
                  >
                    View Candidates
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Psychology />}
                    sx={{ mb: 1 }}
                  >
                    AI Recommendations
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AutoAwesome />}
                    sx={{ mb: 1 }}
                  >
                    Generate Questions
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Box>
                {recentActivities.map((activity, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={activity.type}
                      size="small"
                      color={activity.type === 'job' ? 'primary' : 
                             activity.type === 'candidate' ? 'secondary' :
                             activity.type === 'ai' ? 'success' : 'warning'}
                      sx={{ mr: 2, minWidth: 80 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  AI Recommendation Engine
                </Typography>
                <LinearProgress variant="determinate" value={85} sx={{ mb: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  85% operational
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  LLM Question Generator
                </Typography>
                <LinearProgress variant="determinate" value={92} sx={{ mb: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  92% operational
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardOverview; 
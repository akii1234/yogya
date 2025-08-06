import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Button, CircularProgress, Container } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { fetchDashboardStats } from '../../services/dashboardService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setDashboardData(data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const kpiData = [
    { 
      title: 'Active Jobs', 
      value: dashboardData?.activeJobs || 0, 
      change: '+12%', 
      icon: <TrendingUpIcon color="error" />, 
      bgColor: '#ffe5e5' 
    },
    { 
      title: 'Total Candidates', 
      value: dashboardData?.totalCandidates || 0, 
      change: '+8%', 
      icon: <PeopleIcon color="primary" />, 
      bgColor: '#e3f2fd' 
    },
    { 
      title: 'Time to Fill (avg)', 
      value: dashboardData?.timeToFill || 12, 
      change: '-3%', 
      icon: <AccessTimeIcon color="warning" />, 
      bgColor: '#fff8e1' 
    },
    { 
      title: 'Shortlisted Today', 
      value: dashboardData?.shortlistedToday || 0, 
      change: '+46%', 
      icon: <StarIcon color="error" />, 
      bgColor: '#fce4ec' 
    },
  ];

  const recentActivities = dashboardData?.recentActivity || [
    { id: 1, text: '✅ Candidate Akhil T. shortlisted' },
    { id: 2, text: '📅 3 interviews scheduled' },
    { id: 3, text: '🆕 New JD created: Senior React Developer' },
    { id: 4, text: '📈 Match rate improved' }
  ];

  return (
    <Box sx={{ flexGrow: 1, px: 3, pb: 4, bgcolor: '#f9f9f9', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Dashboard Overview</Typography>
        <Typography variant="body2" gutterBottom>
          Real-time insights into your hiring process and candidate pipeline
        </Typography>

        {/* KPI Cards Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Key Performance Indicators
          </Typography>

          <Grid container spacing={3}>
            {kpiData.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper elevation={3} sx={{ 
                  p: 2, 
                  backgroundColor: item.bgColor,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {item.icon}
                    <Typography variant="body2" sx={{ ml: 1 }} color="green">{item.change}</Typography>
                  </Box>
                  <Typography variant="h5">{item.value}</Typography>
                  <Typography variant="body2">{item.title}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Actions + Activity Section */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {/* Suggested Actions */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Suggested Actions</Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="subtitle1">Schedule Actions</Typography>
              </Box>
              <Typography variant="body2">
                {dashboardData?.pendingApplications || 5} resumes ready for interview scheduling
              </Typography>
              <Button variant="contained" size="small" color="error" sx={{ mt: 1 }}>
                Schedule Now
              </Button>
            </Paper>

            <Paper elevation={1} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EditNoteIcon color="warning" />
                <Typography variant="subtitle1">Update Job Descriptions</Typography>
              </Box>
              <Typography variant="body2">2 JDs missing required skills</Typography>
              <Button variant="contained" size="small" color="error" sx={{ mt: 1 }}>
                Review JDs
              </Button>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Paper elevation={1} sx={{ p: 2 }}>
              {recentActivities.map((activity) => (
                <Typography key={activity.id} variant="body2" gutterBottom>
                  {activity.text}
                </Typography>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 
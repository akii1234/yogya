import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  EditNote as EditNoteIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { fetchDashboardStats } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';
import { getHROrganization, formatJobActivity } from '../utils/organizationUtils';

const ComprehensiveDashboard = ({ defaultTab = 0 }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  // Overview Tab Content
  const OverviewTab = () => {
    const kpiData = [
      { 
        title: 'Active Jobs', 
        value: dashboardData?.activeJobs || 0, 
        change: '+12%', 
        icon: <WorkIcon color="primary" />, 
        bgColor: '#e3f2fd',
        trend: 'up'
      },
      { 
        title: 'Total Candidates', 
        value: dashboardData?.totalCandidates || 0, 
        change: '+8%', 
        icon: <PeopleIcon color="success" />, 
        bgColor: '#e8f5e8',
        trend: 'up'
      },
      { 
        title: 'Time to Fill (avg)', 
        value: `${dashboardData?.timeToFill || 12} days`, 
        change: '-3%', 
        icon: <AccessTimeIcon color="warning" />, 
        bgColor: '#fff8e1',
        trend: 'down'
      },
      { 
        title: 'Shortlisted Today', 
        value: dashboardData?.shortlistedToday || 0, 
        change: '+46%', 
        icon: <StarIcon color="error" />, 
        bgColor: '#fce4ec',
        trend: 'up'
      },
    ];

    const organization = getHROrganization(user);
    const recentActivities = dashboardData?.recentActivity || [
      { id: 1, text: '✅ Candidate Akhil T. shortlisted',  time: '2 hours ago' },
      { id: 2, text: '📅 3 interviews scheduled', time: '4 hours ago' },
      { id: 3, text: `🆕 New JD created: ${formatJobActivity('Senior React Developer', 'JOB-ABC123')}${organization ? ` at ${organization}` : ''}`, time: '6 hours ago' },
      { id: 4, text: '📈 Match rate improved', time: '1 day ago' }
    ];

    return (
      <Box>
        {/* KPI Cards Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Key Performance Indicators
          </Typography>
          <Grid container spacing={3}>
            {kpiData.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: item.bgColor
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.icon}
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Chip 
                        label={item.change} 
                        size="small" 
                        color={item.trend === 'up' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#212121' }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Actions + Activity Section */}
        <Grid container spacing={3}>
          {/* Suggested Actions */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Suggested Actions</Typography>
            <Paper elevation={1} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="subtitle1" fontWeight={600}>Schedule Interviews</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                {dashboardData?.pendingApplications || 5} resumes are ready for interview scheduling
              </Typography>
              <Button variant="contained" size="small" color="primary">
                Schedule Now
              </Button>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EditNoteIcon color="warning" />
                <Typography variant="subtitle1" fontWeight={600}>Update Job Descriptions</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                2 job descriptions are missing required skills information
              </Typography>
              <Button variant="contained" size="small" color="warning">
                Review JDs
              </Button>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              {recentActivities.map((activity) => (
                <Box key={activity.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {activity.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Analytics Tab Content
  const AnalyticsTab = () => {
    const analyticsMetrics = [
      {
        title: 'Total Candidates',
        value: dashboardData?.totalCandidates || 1234,
        change: '+12%',
        icon: <PeopleIcon />,
        color: '#2196F3',
        description: 'Total candidates in the system'
      },
      {
        title: 'Active Jobs',
        value: dashboardData?.activeJobs || 45,
        change: '+5%',
        icon: <WorkIcon />,
        color: '#4CAF50',
        description: 'Currently open job positions'
      },
      {
        title: 'Interviews Scheduled',
        value: dashboardData?.scheduledInterviews || 89,
        change: '+23%',
        icon: <AssessmentIcon />,
        color: '#FF9800',
        description: 'Interviews scheduled this month'
      },
      {
        title: 'Hiring Success Rate',
        value: `${dashboardData?.hiringSuccessRate || 78}%`,
        change: '+8%',
        icon: <TrendingUpIcon />,
        color: '#9C27B0',
        description: 'Percentage of successful hires'
      },
    ];

    const departmentStats = dashboardData?.departmentStats || [
      { department: 'Engineering', openJobs: 15, candidates: 450, successRate: 82 },
      { department: 'Marketing', openJobs: 8, candidates: 120, successRate: 75 },
      { department: 'Sales', openJobs: 12, candidates: 200, successRate: 70 },
      { department: 'HR', openJobs: 5, candidates: 80, successRate: 88 },
      { department: 'Finance', openJobs: 5, candidates: 90, successRate: 85 }
    ];

    return (
      <Box>
        {/* Analytics Metrics */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Analytics Overview
          </Typography>
          <Grid container spacing={3}>
            {analyticsMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{
                        backgroundColor: `${metric.color}20`,
                        color: metric.color,
                        borderRadius: '50%',
                        p: 1,
                        mr: 2,
                      }}>
                        {metric.icon}
                      </Box>
                      <Typography variant="body2" sx={{ color: '#757575', fontWeight: 500 }}>
                        {metric.title}
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#212121', mb: 1 }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600, mb: 1 }}>
                      {metric.change} from last month
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {metric.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Department Analytics */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChartIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                  Department Performance
                </Typography>
              </Box>
              
              {departmentStats.map((dept, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" fontWeight={500}>{dept.department}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dept.openJobs} jobs • {dept.candidates} candidates
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dept.successRate} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: dept.successRate > 80 ? '#4CAF50' : dept.successRate > 70 ? '#FF9800' : '#F44336'
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {dept.successRate}% success rate
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 8px rgba(0,0,0,0.1)', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChartIcon sx={{ mr: 1, color: '#9C27B0' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                  Hiring Pipeline
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Applied: 85%</Typography>
                <LinearProgress variant="determinate" value={85} sx={{ mb: 1 }} />
                
                <Typography variant="body2" color="text.secondary">Screened: 60%</Typography>
                <LinearProgress variant="determinate" value={60} sx={{ mb: 1 }} />
                
                <Typography variant="body2" color="text.secondary">Interviewed: 35%</Typography>
                <LinearProgress variant="determinate" value={35} sx={{ mb: 1 }} />
                
                <Typography variant="body2" color="text.secondary">Hired: 15%</Typography>
                <LinearProgress variant="determinate" value={15} />
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon sx={{ mr: 1, color: '#FF5722' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                  Trends
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
                Monthly hiring trends and forecasts will be displayed here with interactive charts.
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                Coming soon: Advanced analytics dashboard with real-time charts and predictive insights.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, px: 3, pb: 4, bgcolor: '#f9f9f9', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Comprehensive view of your hiring process and analytics
        </Typography>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Overview" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && <AnalyticsTab />}
        </Box>
      </Container>
    </Box>
  );
};

export default ComprehensiveDashboard;
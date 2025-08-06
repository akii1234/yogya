import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  People,
  Work,
  Psychology,
  AutoAwesome
} from '@mui/icons-material';

const AnalyticsDashboard = () => {
  const metrics = [
    {
      title: 'Total Applications',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: <People />,
      color: 'primary'
    },
    {
      title: 'Job Postings',
      value: '45',
      change: '+5%',
      trend: 'up',
      icon: <Work />,
      color: 'secondary'
    },
    {
      title: 'AI Recommendations',
      value: '89',
      change: '+23%',
      trend: 'up',
      icon: <Psychology />,
      color: 'success'
    },
    {
      title: 'LLM Questions',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: <AutoAwesome />,
      color: 'warning'
    }
  ];

  const recentTrends = [
    { metric: 'Applications', value: '+15%', period: 'This week' },
    { metric: 'Interviews', value: '+8%', period: 'This week' },
    { metric: 'Hires', value: '+3%', period: 'This month' },
    { metric: 'AI Usage', value: '+25%', period: 'This month' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Analytics color="primary" />
        Analytics Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: `${metric.color}.light`, 
                    color: `${metric.color}.main`,
                    mr: 2
                  }}>
                    {metric.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {metric.value}
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                      {metric.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {metric.trend === 'up' ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                  <Typography 
                    variant="caption" 
                    color={metric.trend === 'up' ? 'success.main' : 'error.main'}
                    sx={{ ml: 0.5 }}
                  >
                    {metric.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Trends */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Trends
              </Typography>
              <Box>
                {recentTrends.map((trend, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">{trend.metric}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={trend.value} 
                        size="small" 
                        color="success"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {trend.period}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Performance
              </Typography>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Question Generation</Typography>
                  <Chip label="92%" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Recommendation Accuracy</Typography>
                  <Chip label="87%" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Response Time</Typography>
                  <Chip label="2.3s" size="small" color="info" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Cost Efficiency</Typography>
                  <Chip label="85%" size="small" color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Info Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analytics Overview
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This analytics dashboard provides insights into your hiring process, AI system performance, 
            and overall recruitment metrics. The data is updated in real-time and helps you make 
            informed decisions about your hiring strategy.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard; 
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Work,
  Assessment,
} from '@mui/icons-material';

const AnalyticsPage = () => {
  const metrics = [
    {
      title: 'Total Candidates',
      value: '1,234',
      change: '+12%',
      icon: <People />,
      color: '#2196F3',
    },
    {
      title: 'Active Jobs',
      value: '45',
      change: '+5%',
      icon: <Work />,
      color: '#4CAF50',
    },
    {
      title: 'Interviews Scheduled',
      value: '89',
      change: '+23%',
      icon: <Assessment />,
      color: '#FF9800',
    },
    {
      title: 'Hiring Success Rate',
      value: '78%',
      change: '+8%',
      icon: <TrendingUp />,
      color: '#9C27B0',
    },
  ];

  return (
    <Box sx={{ width: '100%', px: 3, py: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#212121',
          mb: 3,
        }}
      >
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 2,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: `${metric.color}20`,
                      color: metric.color,
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#757575',
                      fontWeight: 500,
                    }}
                  >
                    {metric.title}
                  </Typography>
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#212121',
                    mb: 1,
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#4CAF50',
                    fontWeight: 600,
                  }}
                >
                  {metric.change} from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#212121',
                mb: 2,
              }}
            >
              Recent Activity
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Analytics charts and detailed metrics will be implemented here.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#212121',
                mb: 2,
              }}
            >
              Performance Insights
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              Detailed performance analytics and insights will be displayed here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage; 
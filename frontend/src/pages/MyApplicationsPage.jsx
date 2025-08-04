import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Work, Business, Schedule, CheckCircle, Pending, Cancel } from '@mui/icons-material';
import { api } from '../services/api';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/candidate-portal/my-applications/');
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return <Pending sx={{ color: '#FF9800' }} />;
      case 'reviewing':
        return <Pending sx={{ color: '#2196F3' }} />;
      case 'interviewing':
        return <Schedule sx={{ color: '#9C27B0' }} />;
      case 'accepted':
        return <CheckCircle sx={{ color: '#4CAF50' }} />;
      case 'rejected':
        return <Cancel sx={{ color: '#F44336' }} />;
      default:
        return <Pending sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return '#FF9800';
      case 'reviewing':
        return '#2196F3';
      case 'interviewing':
        return '#9C27B0';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
        My Applications
      </Typography>

      {applications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Work sx={{ fontSize: 64, color: '#E0E0E0', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#757575', mb: 1 }}>
            No applications yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            Start browsing jobs to submit your first application
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} lg={4} key={application.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Business sx={{ mr: 1, color: '#757575' }} />
                    <Typography
                      variant="body2"
                      sx={{ color: '#757575', fontWeight: 500 }}
                    >
                      {application.job?.company || 'Company Name'}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#212121',
                      mb: 1,
                    }}
                  >
                    {application.job?.title || 'Job Title'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(application.status)}
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: getStatusColor(application.status),
                        fontWeight: 600,
                        ml: 1,
                      }}
                    >
                      {application.status || 'Applied'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule sx={{ mr: 1, color: '#757575', fontSize: 16 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: '#757575' }}
                    >
                      Applied on {new Date(application.applied_date || Date.now()).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  {application.match_score && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: '#757575', mb: 1 }}
                      >
                        Match Score
                      </Typography>
                      <Chip
                        label={`${application.match_score}%`}
                        size="small"
                        sx={{
                          backgroundColor: application.match_score >= 80 ? '#E8F5E8' : 
                                          application.match_score >= 60 ? '#FFF3E0' : '#FFEBEE',
                          color: application.match_score >= 80 ? '#2E7D32' : 
                                 application.match_score >= 60 ? '#F57C00' : '#D32F2F',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {application.job?.experience_level && (
                      <Chip
                        label={application.job.experience_level}
                        size="small"
                        sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
                      />
                    )}
                    {application.job?.department && (
                      <Chip
                        label={application.job.department}
                        size="small"
                        sx={{ backgroundColor: '#F3E5F5', color: '#7B1FA2' }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyApplicationsPage; 
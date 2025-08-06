import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import { getMyApplications } from '../../services/candidateService';

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading applications for authenticated user...');
      const data = await getMyApplications();
      console.log('✅ Applications loaded:', data);
      setApplications(data);
    } catch (error) {
      console.error('❌ Error loading applications:', error);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'success';
      case 'under_review':
        return 'warning';
      case 'interview_scheduled':
        return 'info';
      case 'shortlisted':
        return 'success';
      case 'offer_made':
        return 'success';
      case 'offer_accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'error';
      default:
        return 'success';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <CheckCircleIcon />;
      case 'under_review':
        return <PendingIcon />;
      case 'interview_scheduled':
        return <ScheduleIcon />;
      case 'shortlisted':
        return <CheckCircleIcon />;
      case 'offer_made':
        return <CheckCircleIcon />;
      case 'offer_accepted':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CancelIcon />;
      case 'withdrawn':
        return <CancelIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'under_review':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'interviewed':
        return 'Interviewed';
      case 'offer_made':
        return 'Offer Made';
      case 'offer_accepted':
        return 'Offer Accepted';
      case 'offer_declined':
        return 'Offer Declined';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return 'Unknown';
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        My Applications ({applications.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No applications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start browsing jobs and apply to positions that interest you.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} key={application.id} sx={{ display: 'flex', minWidth: 0 }}>
              <Card 
                elevation={2} 
                sx={{ 
                  width: '100%',
                  minWidth: 280,
                  height: '100%',
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '100%',
                  height: '100%',
                  flexGrow: 1,
                  p: 3
                }}>
                  {/* Status Chip - Moved to top */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, width: '100%' }}>
                    <Chip
                      icon={getStatusIcon(application.status)}
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status)}
                      variant="filled"
                      sx={{ 
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        }
                      }}
                    />
                  </Box>

                  {/* Job Title and Company */}
                  <Box sx={{ mb: 2, flexGrow: 0, width: '100%' }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.2,
                        minHeight: '2.4em', // Ensures consistent height for 2 lines
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {application.jobTitle}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontWeight: 500,
                        minHeight: '1.2em' // Ensures consistent height
                      }}
                    >
                      {application.company}
                    </Typography>
                  </Box>

                  {/* Applied Date and Match Score */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Applied on {application.appliedDate}
                      </Typography>
                    </Box>
                    {application.matchScore && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Match: {application.matchScore}%
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mb: 2, flexGrow: 0, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Next Step:
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{
                        minHeight: '1.5em', // Ensures consistent height
                        lineHeight: 1.4
                      }}
                    >
                      {application.nextStep}
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Application Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round((application.timeline.filter(t => t.completed).length / application.timeline.length) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(application.timeline.filter(t => t.completed).length / application.timeline.length) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Spacer to push button to bottom */}
                  <Box sx={{ flexGrow: 1, width: '100%' }} />

                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(application)}
                    fullWidth
                    sx={{ mt: 'auto', width: '100%' }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Application Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Application Details - {selectedApplication?.jobTitle}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Job Information</Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Position:</strong> {selectedApplication.jobTitle}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Company:</strong> {selectedApplication.company}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Applied Date:</strong> {selectedApplication.appliedDate}
                  </Typography>
                  {selectedApplication.matchScore && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Match Score:</strong> {selectedApplication.matchScore}%
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Current Status</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(selectedApplication.status)}
                      label={getStatusLabel(selectedApplication.status)}
                      color={getStatusColor(selectedApplication.status)}
                      sx={{ mr: 2 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Next Step:</strong> {selectedApplication.nextStep}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Application Timeline</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedApplication.timeline.map((step, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: step.completed ? '#4caf50' : '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {step.completed && <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">
                          {step.step}
                        </Typography>
                        {step.date && (
                          <Typography variant="caption" color="text.secondary">
                            {step.date}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationTracker; 
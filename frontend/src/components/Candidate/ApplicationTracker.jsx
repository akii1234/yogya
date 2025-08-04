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

  // For demo purposes, using a mock candidate ID
  const candidateId = 1; // This would come from authentication in real app

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications(candidateId);
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
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
        return <PendingIcon />;
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
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} key={application.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {application.jobTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.company}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(application.status)}
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        Applied
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.appliedDate}
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

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Next Step:
                    </Typography>
                    <Typography variant="body1">
                      {application.nextStep}
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
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

                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(application)}
                    fullWidth
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
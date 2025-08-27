import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Assignment,
  Timer,
  Star,
  TrendingUp,
  Schedule,
  Work,
  NavigateNext
} from '@mui/icons-material';

const ApplicationSuccessModal = ({ 
  open, 
  onClose, 
  jobTitle, 
  companyName, 
  onStartAssessment,
  onViewApplications 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#f8f9fa', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <CheckCircle sx={{ color: '#2e7d32', fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
            Application Submitted Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your application has been received and is being processed
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Job Details */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Work sx={{ color: '#db0011', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {jobTitle}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {companyName}
          </Typography>
        </Box>

        {/* Assessment Information */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            📋 Next Step: Complete Required Assessment
          </Typography>
          <Typography variant="body2">
            To proceed with your application, you need to complete a knowledge assessment 
            based on the job requirements and your resume.
          </Typography>
        </Alert>

        {/* Assessment Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
            Assessment Details
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Timer sx={{ color: '#db0011' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Duration: 20 minutes"
                secondary="Complete all questions within the time limit"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Assignment sx={{ color: '#db0011' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Question Mix"
                secondary="50% AI-generated (JD-Resume based) + 50% Pre-defined questions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Star sx={{ color: '#db0011' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Scoring: Percentage-based"
                secondary="Your score determines interview eligibility"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TrendingUp sx={{ color: '#db0011' }} />
              </ListItemIcon>
              <ListItemText 
                primary="3 Attempts Allowed"
                secondary="You can retake the assessment up to 3 times"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Eligibility Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
            Interview Eligibility
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<CheckCircle />} 
              label="High Score (80%+): Direct Interview" 
              color="success" 
              variant="outlined"
            />
            <Chip 
              icon={<Schedule />} 
              label="Medium Score (60-79%): HR Review" 
              color="warning" 
              variant="outlined"
            />
            <Chip 
              icon={<NavigateNext />} 
              label="Low Score (<60%): Not Eligible" 
              color="error" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Important Note */}
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ⚠️ Assessment completion is mandatory to proceed to the interview stage.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onViewApplications}
          variant="outlined"
          sx={{ 
            minWidth: 140,
            borderColor: '#db0011',
            color: '#db0011',
            '&:hover': {
              borderColor: '#b71c1c',
              backgroundColor: '#fff5f5'
            }
          }}
        >
          Complete Later
        </Button>
        <Button 
          onClick={onStartAssessment}
          variant="contained"
          sx={{ 
            minWidth: 140,
            bgcolor: '#db0011',
            '&:hover': {
              bgcolor: '#b71c1c'
            }
          }}
        >
          Start Assessment Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationSuccessModal;

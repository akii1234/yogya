import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  TrendingUp,
  Star,
  EmojiEvents
} from '@mui/icons-material';

const AssessmentResults = ({
  open,
  onClose,
  score,
  totalQuestions,
  correctAnswers,
  timeSpent,
  jobTitle,
  companyName
}) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#ed6c02';
    return '#d32f2f';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) {
      return {
        title: '🎉 Excellent Performance!',
        subtitle: 'You\'re eligible for direct interview scheduling'
      };
    } else if (score >= 60) {
      return {
        title: '👍 Good Performance!',
        subtitle: 'Your application will be reviewed by HR'
      };
    } else {
      return {
        title: '📝 Keep Improving!',
        subtitle: 'You may retake the assessment'
      };
    }
  };

  const scoreMessage = getScoreMessage(score);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: getScoreColor(score) }}>
          Assessment Complete
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {jobTitle} • {companyName}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ 
          fontWeight: 700, 
          color: getScoreColor(score),
          mb: 2
        }}>
          {score}%
        </Typography>
        
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {scoreMessage.title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {scoreMessage.subtitle}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Chip
            icon={<CheckCircle />}
            label={`${correctAnswers}/${totalQuestions} Correct`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<Star />}
            label={`${score}% Score`}
            sx={{ color: getScoreColor(score), borderColor: getScoreColor(score) }}
            variant="outlined"
          />
        </Box>

        {score < 60 && (
          <Alert severity="warning">
            You have 2 more attempts remaining to improve your score.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#db0011',
            '&:hover': { bgcolor: '#b71c1c' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentResults;

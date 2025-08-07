import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  QuestionAnswer as QuestionIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  Assignment as AssignmentIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

const InterviewPrepModal = ({ open, onClose, interviewPrep, jobTitle, jobCompany }) => {
  const [expandedSection, setExpandedSection] = useState('technical');

  const handleSectionChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : false);
  };

  if (!interviewPrep) return null;

  const guide = interviewPrep.interview_guide || {};

  const renderTechnicalQuestions = () => (
    <Accordion expanded={expandedSection === 'technical'} onChange={handleSectionChange('technical')}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <QuestionIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Technical Questions ({guide.technical_questions?.length || 0})
          </Typography>
          <Chip label="Prepare Answers" size="small" color="primary" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {guide.technical_questions?.map((question, index) => (
            <ListItem key={index} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <QuestionIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={question}
                primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Prepare specific examples from your experience for each question. 
            Use the STAR method (Situation, Task, Action, Result) to structure your responses.
          </Typography>
        </Alert>
      </AccordionDetails>
    </Accordion>
  );

  const renderBehavioralQuestions = () => (
    <Accordion expanded={expandedSection === 'behavioral'} onChange={handleSectionChange('behavioral')}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Behavioral Questions ({guide.behavioral_questions?.length || 0})
          </Typography>
          <Chip label="STAR Method" size="small" color="secondary" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {guide.behavioral_questions?.map((question, index) => (
            <ListItem key={index} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PsychologyIcon color="secondary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={question}
                primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>STAR Method:</strong> Situation (context), Task (your role), Action (what you did), 
            Result (outcome). Always end with positive results when possible.
          </Typography>
        </Alert>
      </AccordionDetails>
    </Accordion>
  );

  const renderQuestionsToAsk = () => (
    <Accordion expanded={expandedSection === 'ask'} onChange={handleSectionChange('ask')}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Questions to Ask ({guide.questions_to_ask?.length || 0})
          </Typography>
          <Chip label="Show Interest" size="small" color="success" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {guide.questions_to_ask?.map((question, index) => (
            <ListItem key={index} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SchoolIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={question}
                primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Pro Tip:</strong> Asking thoughtful questions shows genuine interest and helps you 
            evaluate if the role is right for you. Always have 2-3 questions prepared.
          </Typography>
        </Alert>
      </AccordionDetails>
    </Accordion>
  );

  const renderTalkingPoints = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            Key Talking Points
          </Typography>
        </Box>
        <List dense>
          {guide.talking_points?.map((point, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <LightbulbIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={point} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderChallenges = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon sx={{ mr: 1, color: 'warning.main' }} />
          <Typography variant="h6" color="warning.main">
            Potential Challenges & Solutions
          </Typography>
        </Box>
        <List dense>
          {guide.challenges?.map((challenge, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <AssignmentIcon color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={challenge} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderSalaryStrategy = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="h6" color="success.main">
            Salary Negotiation Strategy
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ pl: 4 }}>
          {guide.salary_strategy}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderFollowUpActions = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon sx={{ mr: 1, color: 'info.main' }} />
          <Typography variant="h6" color="info.main">
            Follow-Up Actions
          </Typography>
        </Box>
        <List dense>
          {guide.follow_up_actions?.map((action, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                {action.toLowerCase().includes('email') ? (
                  <EmailIcon color="info" fontSize="small" />
                ) : action.toLowerCase().includes('linkedin') ? (
                  <LinkedInIcon color="info" fontSize="small" />
                ) : (
                  <ScheduleIcon color="info" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText primary={action} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
            Interview Preparation Guide
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {jobTitle} at {jobCompany}
          </Typography>
          {interviewPrep.ai_generated && (
            <Chip 
              label="AI Generated" 
              size="small" 
              color="success" 
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 0 }}>
        <Box>
          {/* AI Confidence Score */}
          {interviewPrep.confidence_score && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>AI Confidence:</strong> {Math.round(interviewPrep.confidence_score * 100)}% 
                - This guide is tailored specifically for this role and your profile.
              </Typography>
            </Alert>
          )}

          {/* Interview Questions Sections */}
          {renderTechnicalQuestions()}
          {renderBehavioralQuestions()}
          {renderQuestionsToAsk()}

          <Divider sx={{ my: 3 }} />

          {/* Strategy Cards */}
          <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
            Interview Strategy
          </Typography>
          
          {renderTalkingPoints()}
          {renderChallenges()}
          {renderSalaryStrategy()}
          {renderFollowUpActions()}

          {/* General Tips */}
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Remember:</strong> Practice your responses, research the company thoroughly, 
              and prepare specific examples from your experience. Confidence comes from preparation!
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewPrepModal; 
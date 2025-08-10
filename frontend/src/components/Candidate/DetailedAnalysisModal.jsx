import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { getDetailedMatchAnalysis } from '../../services/candidateService';
import InterviewPrepModal from './InterviewPrepModal';

const DetailedAnalysisModal = ({ open, onClose, jobId, jobTitle, jobCompany }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);

  useEffect(() => {
    if (open && jobId) {
      loadDetailedAnalysis();
    }
  }, [open, jobId]);

  const loadDetailedAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDetailedMatchAnalysis(jobId);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading detailed analysis:', error);
      setError('Failed to load detailed analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#2196f3';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const renderSkillAnalysis = () => {
    if (!analysis?.detailed_analysis?.skill_analysis) return null;
    
    const skillData = analysis.detailed_analysis.skill_analysis;
    
    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Skills Analysis ({skillData.score}%)
            </Typography>
            <Chip 
              label={`${skillData.weight}% weight`} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Score Progress */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Skills Match: {skillData.match_percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {skillData.matched_skills.length} of {skillData.total_required} skills
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={skillData.score}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(skillData.score)
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Matched Skills */}
            {skillData.matched_skills.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="subtitle2" gutterBottom color="success.main">
                    ✅ Your Skills ({skillData.matched_skills.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {skillData.matched_skills.map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            )}

            {/* Missing Skills */}
            {skillData.missing_skills.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" gutterBottom color="warning.main">
                    ❌ Missing Skills ({skillData.missing_skills.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {skillData.missing_skills.map((skill, index) => (
                      <Chip 
                        key={index} 
                        label={skill} 
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            )}

            {/* Recommendations */}
            {skillData.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<LightbulbIcon />}>
                  <Typography variant="body2">
                    {skillData.recommendations[0]}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderExperienceAnalysis = () => {
    if (!analysis?.detailed_analysis?.experience_analysis) return null;
    
    const expData = analysis.detailed_analysis.experience_analysis;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Experience Analysis ({expData.score}%)
            </Typography>
            <Chip 
              label={`${expData.weight}% weight`} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Required Experience
                </Typography>
                <Typography variant="h4" color="primary">
                  {expData.required_years}+ years
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Your Experience
                </Typography>
                <Typography variant="h4" color={expData.status === 'exceeds' ? 'success.main' : 'warning.main'}>
                  {expData.candidate_years} years
                </Typography>
              </Card>
            </Grid>
            {expData.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Alert severity={expData.status === 'exceeds' ? 'success' : 'warning'}>
                  {expData.recommendations[0]}
                </Alert>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderEducationAnalysis = () => {
    if (!analysis?.detailed_analysis?.education_analysis) return null;
    
    const eduData = analysis.detailed_analysis.education_analysis;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Education Analysis ({eduData.score}%)
            </Typography>
            <Chip 
              label={`${eduData.weight}% weight`} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Job Level
                </Typography>
                <Typography variant="h6" color="primary">
                  {eduData.required_level || 'Not specified'}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Your Education
                </Typography>
                <Typography variant="h6" color={eduData.status === 'suitable' ? 'success.main' : 'warning.main'}>
                  {eduData.candidate_level || 'Not specified'}
                </Typography>
              </Card>
            </Grid>
            {eduData.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Alert severity={eduData.status === 'suitable' ? 'success' : 'warning'}>
                  {eduData.recommendations[0]}
                </Alert>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderLocationAnalysis = () => {
    if (!analysis?.detailed_analysis?.location_analysis) return null;
    
    const locData = analysis.detailed_analysis.location_analysis;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Location Analysis ({locData.score}%)
            </Typography>
            <Chip 
              label={`${locData.weight}% weight`} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Job Location
                </Typography>
                <Typography variant="body1">
                  {locData.job_location || 'Not specified'}
                </Typography>
                <Chip 
                  label={locData.status} 
                  size="small" 
                  color={locData.status === 'remote' ? 'success' : 'default'}
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Your Location
                </Typography>
                <Typography variant="body1">
                  {locData.candidate_location || 'Not specified'}
                </Typography>
              </Card>
            </Grid>
            {locData.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  {locData.recommendations[0]}
                </Alert>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderImprovementPlan = () => {
    if (!analysis?.improvement_plan) return null;
    
    const plan = analysis.improvement_plan;
    
    return (
      <Card sx={{ mt: 2, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" color="primary">
              Improvement Plan
            </Typography>
          </Box>
          
          {plan.priority_areas.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Priority Areas:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {plan.priority_areas.map((area, index) => (
                  <Chip key={index} label={area} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          
          {plan.skill_development.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Skill Development:
              </Typography>
              <List dense>
                {plan.skill_development.map((skill, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={skill} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Timeline: {plan.timeline}
            </Typography>
            <Chip 
              label={`+${plan.estimated_score_improvement}% potential improvement`}
              color="success"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderAIInsights = () => {
    if (!analysis?.ai_enhancement) return null;
    
    const aiData = analysis.ai_enhancement;
    const insights = aiData.insights || {};
    
    return (
      <Card sx={{ mt: 2, bgcolor: '#e3f2fd' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" color="primary">
              AI-Powered Insights
            </Typography>
            {aiData.ai_enhanced && (
              <Chip 
                label="AI Enhanced" 
                size="small" 
                color="success" 
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          
          {/* Career Recommendations */}
          {insights.career_recommendations && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Career Development Recommendations
              </Typography>
              <List dense>
                {insights.career_recommendations.map((rec, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <TrendingUpIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {/* Industry Insights */}
          {insights.industry_insights && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Industry Insights
              </Typography>
              <List dense>
                {insights.industry_insights.map((insight, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <WorkIcon color="secondary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={insight} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {/* Learning Path */}
          {insights.learning_path && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Personalized Learning Path
              </Typography>
              <Alert severity="info" icon={<LightbulbIcon />}>
                <Typography variant="body2">
                  {insights.learning_path}
                </Typography>
              </Alert>
            </Box>
          )}
          
          {/* Interview Tips */}
          {insights.interview_tips && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Interview Preparation Tips
              </Typography>
              <List dense>
                {insights.interview_tips.map((tip, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <PsychologyIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {/* Salary Insight */}
          {insights.salary_insight && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Salary Negotiation Insight
              </Typography>
              <Alert severity="warning">
                <Typography variant="body2">
                  {insights.salary_insight}
                </Typography>
              </Alert>
            </Box>
          )}
          
          {/* Career Advice */}
          {insights.career_advice && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Overall Career Advice
              </Typography>
              <Alert severity="success">
                <Typography variant="body2">
                  {insights.career_advice}
                </Typography>
              </Alert>
            </Box>
          )}
          
          {/* AI Confidence */}
          {aiData.confidence_score && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Chip 
                label={`AI Confidence: ${Math.round(aiData.confidence_score * 100)}%`}
                color="info"
                variant="outlined"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

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
            Detailed Match Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {jobTitle} at {jobCompany}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {analysis && (
          <Box>
            {/* Overall Score */}
            <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {analysis.detailed_analysis.overall_score}%
                  </Typography>
                  <Chip 
                    label={getScoreLabel(analysis.detailed_analysis.overall_score)}
                    color={analysis.detailed_analysis.overall_score >= 80 ? 'success' : 
                           analysis.detailed_analysis.overall_score >= 60 ? 'primary' : 
                           analysis.detailed_analysis.overall_score >= 40 ? 'warning' : 'error'}
                    sx={{ ml: 2 }}
                  />
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={analysis.detailed_analysis.overall_score}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(analysis.detailed_analysis.overall_score)
                    }
                  }}
                />
                
                {analysis.detailed_analysis.overall_recommendations.length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {analysis.detailed_analysis.overall_recommendations[0]}
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {/* Tabs for different sections */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                aria-label="analysis tabs"
              >
                <Tab label="Detailed Analysis" />
                <Tab label="AI Insights" />
                <Tab label="Interview Prep" />
              </Tabs>
            </Box>
            
            {/* Tab Content */}
            {activeTab === 0 && (
              <Box>
                {/* Detailed Analysis Sections */}
                {renderSkillAnalysis()}
                {renderExperienceAnalysis()}
                {renderEducationAnalysis()}
                {renderLocationAnalysis()}
                
                {/* Improvement Plan */}
                {renderImprovementPlan()}
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                {/* AI Insights */}
                {renderAIInsights()}
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                {/* Interview Prep Preview */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" color="primary">
                        Interview Preparation Guide
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Get personalized interview questions, behavioral tips, and preparation strategies 
                      tailored specifically for this role and your profile.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${analysis.interview_prep?.interview_guide?.technical_questions?.length || 0} Technical Questions`}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={`${analysis.interview_prep?.interview_guide?.behavioral_questions?.length || 0} Behavioral Questions`}
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip 
                        label={`${analysis.interview_prep?.interview_guide?.questions_to_ask?.length || 0} Questions to Ask`}
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Button
                      variant="contained"
                      startIcon={<PsychologyIcon />}
                      onClick={() => setShowInterviewPrep(true)}
                      sx={{ mt: 2 }}
                    >
                      View Full Interview Guide
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            )}
            

          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>

      {/* Interview Prep Modal */}
      <InterviewPrepModal
        open={showInterviewPrep}
        onClose={() => setShowInterviewPrep(false)}
        interviewPrep={analysis?.interview_prep}
        jobTitle={jobTitle}
        jobCompany={jobCompany}
      />
      

    </Dialog>
  );
};

export default DetailedAnalysisModal; 
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Rating,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  TrendingUp,
  Assessment,
  Lightbulb,
  Star,
  CheckCircle,
  Warning,
  Info,
  Refresh,
  Download,
  Share
} from '@mui/icons-material';
import api from '../../services/api';

const AIRecommendationEngine = () => {
  const [formData, setFormData] = useState({
    job_description: '',
    resume_text: '',
    candidate_level: 'mid-level',
    interview_type: 'mixed',
    question_count: 10
  });
  
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const generateRecommendations = async () => {
    if (!formData.job_description && !formData.resume_text) {
      setError('Please provide at least a job description or resume text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/competency/question-bank/advanced_recommendations/', formData);
      setRecommendations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'technical': return 'primary';
      case 'behavioral': return 'secondary';
      case 'situational': return 'info';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Psychology color="primary" />
        AI Recommendation Engine
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Generate intelligent question recommendations based on job requirements, candidate profile, and success patterns.
      </Typography>

      {/* Input Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Interview Context
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                value={formData.job_description}
                onChange={handleInputChange('job_description')}
                placeholder="Enter job requirements, skills needed, and role expectations..."
                helperText="Describe the position, required skills, and responsibilities"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Candidate Resume/Profile"
                value={formData.resume_text}
                onChange={handleInputChange('resume_text')}
                placeholder="Enter candidate's experience, skills, and background..."
                helperText="Paste resume text or candidate profile information"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Candidate Level"
                value={formData.candidate_level}
                onChange={handleInputChange('candidate_level')}
                SelectProps={{ native: true }}
              >
                <option value="junior">Junior</option>
                <option value="mid-level">Mid-Level</option>
                <option value="senior">Senior</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Interview Type"
                value={formData.interview_type}
                onChange={handleInputChange('interview_type')}
                SelectProps={{ native: true }}
              >
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="mixed">Mixed</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Number of Questions"
                value={formData.question_count}
                onChange={handleInputChange('question_count')}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generateRecommendations}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
            >
              {loading ? 'Generating...' : 'Generate AI Recommendations'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setFormData({
                job_description: '',
                resume_text: '',
                candidate_level: 'mid-level',
                interview_type: 'mixed',
                question_count: 10
              })}
            >
              Clear Form
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {recommendations && (
        <Box>
          {/* Context Analysis */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" />
                Context Analysis
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Detected Skills
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Job Requirements:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {recommendations.context_analysis.detected_skills.job_requirements.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Candidate Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {recommendations.context_analysis.detected_skills.candidate_skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" color="secondary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Analysis Insights
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Skill Gaps:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {recommendations.context_analysis.skill_gaps.map((gap, index) => (
                        <Chip key={index} label={gap} size="small" color="error" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Strengths:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {recommendations.context_analysis.strengths.map((strength, index) => (
                        <Chip key={index} label={strength} size="small" color="success" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">
                  Confidence Score:
                </Typography>
                <Rating 
                  value={recommendations.confidence_score * 5} 
                  readOnly 
                  precision={0.1}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(recommendations.confidence_score * 100)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Interview Strategy */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="primary" />
                Interview Strategy
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Recommended Flow
                  </Typography>
                  <List dense>
                    {recommendations.interview_strategy.interview_flow.map((step, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            {index + 1}.
                          </Typography>
                        </ListItemIcon>
                        <ListItemText primary={step} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Key Areas to Probe
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {recommendations.interview_strategy.key_areas_to_probe.map((area, index) => (
                      <Chip key={index} label={area} size="small" color="primary" />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Time Allocation
                  </Typography>
                  {Object.entries(recommendations.interview_strategy.time_allocation).map(([type, time]) => (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {type.replace('_', ' ')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {time}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Question Recommendations */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="primary" />
                  Recommended Questions ({recommendations.recommendations.length})
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Export Recommendations">
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share Strategy">
                    <IconButton size="small">
                      <Share />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Stack spacing={2}>
                {recommendations.recommendations.map((question, index) => (
                  <Accordion key={question.id} defaultExpanded={index < 3}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                          #{index + 1}
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {question.question_text}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip 
                            label={question.question_type} 
                            size="small" 
                            color={getQuestionTypeColor(question.question_type)}
                          />
                          <Chip 
                            label={question.difficulty} 
                            size="small" 
                            color={getDifficultyColor(question.difficulty)}
                          />
                          <Rating 
                            value={question.recommendation_score * 5} 
                            readOnly 
                            precision={0.1}
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(question.recommendation_score * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Question Details
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {question.tags.map((tag, tagIndex) => (
                              <Chip key={tagIndex} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                          
                          {question.reasoning.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                AI Reasoning:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {question.reasoning.map((reason, reasonIndex) => (
                                  <Chip 
                                    key={reasonIndex} 
                                    label={reason} 
                                    size="small" 
                                    color="success" 
                                    icon={<CheckCircle />}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Scoring Breakdown
                          </Typography>
                          
                          <Stack spacing={1}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Skill Relevance</Typography>
                                <Typography variant="body2" color={getScoreColor(question.skill_relevance)}>
                                  {Math.round(question.skill_relevance * 100)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={question.skill_relevance * 100}
                                color={getScoreColor(question.skill_relevance)}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Difficulty Match</Typography>
                                <Typography variant="body2" color={getScoreColor(question.difficulty_match)}>
                                  {Math.round(question.difficulty_match * 100)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={question.difficulty_match * 100}
                                color={getScoreColor(question.difficulty_match)}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Framework Alignment</Typography>
                                <Typography variant="body2" color={getScoreColor(question.framework_alignment)}>
                                  {Math.round(question.framework_alignment * 100)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={question.framework_alignment * 100}
                                color={getScoreColor(question.framework_alignment)}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Success Rate</Typography>
                                <Typography variant="body2" color={getScoreColor(question.success_rate)}>
                                  {Math.round(question.success_rate * 100)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={question.success_rate * 100}
                                color={getScoreColor(question.success_rate)}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AIRecommendationEngine; 
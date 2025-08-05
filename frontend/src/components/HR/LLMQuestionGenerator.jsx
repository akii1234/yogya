import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Psychology,
  Add,
  Refresh,
  CheckCircle,
  Warning,
  Info,
  ExpandMore,
  Download,
  Share,
  AutoAwesome,
  SmartToy,
  QuestionAnswer,
  TrendingUp,
  Speed,
  AttachMoney
} from '@mui/icons-material';
import axios from 'axios';

const LLMQuestionGenerator = () => {
  const [prompts, setPrompts] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [generationParams, setGenerationParams] = useState({
    skill: '',
    level: 'medium',
    type: 'technical',
    count: 3,
    context: '',
    autoApprove: false
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalGenerations: 0,
    approvedQuestions: 0,
    pendingReview: 0
  });

  const API_BASE_URL = 'http://localhost:8002/api/competency';

  useEffect(() => {
    fetchPrompts();
    fetchGenerations();
    fetchStats();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/llm-prompts/`);
      setPrompts(response.data.results);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenerations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/llm-generations/`);
      setGenerations(response.data.results);
    } catch (error) {
      console.error('Error fetching generations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [promptsRes, generationsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/llm-prompts/`),
        axios.get(`${API_BASE_URL}/llm-generations/`)
      ]);
      
      const approvedCount = generationsRes.data.results.filter(g => g.status === 'added_to_bank').length;
      const pendingCount = generationsRes.data.results.filter(g => g.status === 'pending_review').length;
      
      setStats({
        totalPrompts: promptsRes.data.count,
        totalGenerations: generationsRes.data.count,
        approvedQuestions: approvedCount,
        pendingReview: pendingCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateQuestions = async () => {
    if (!selectedPrompt) {
      alert('Please select a prompt template');
      return;
    }

    try {
      setGenerating(true);
      const response = await axios.post(`${API_BASE_URL}/llm-prompts/${selectedPrompt}/generate_question/`, {
        skill: generationParams.skill,
        level: generationParams.level,
        question_type: generationParams.type,
        context: generationParams.context,
        auto_approve: generationParams.autoApprove
      });

      if (response.data.success) {
        setGeneratedQuestions(prev => [...prev, response.data.question]);
        fetchGenerations();
        fetchStats();
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Error generating questions. Please check your API key and credits.');
    } finally {
      setGenerating(false);
    }
  };

  const batchGenerate = async () => {
    if (!selectedPrompt) {
      alert('Please select a prompt template');
      return;
    }

    try {
      setGenerating(true);
      const response = await axios.post(`${API_BASE_URL}/llm-prompts/${selectedPrompt}/batch_generate/`, {
        skill: generationParams.skill,
        level: generationParams.level,
        question_type: generationParams.type,
        count: generationParams.count,
        context: generationParams.context,
        auto_approve: generationParams.autoApprove
      });

      if (response.data.success) {
        setGeneratedQuestions(prev => [...prev, ...response.data.questions]);
        fetchGenerations();
        fetchStats();
      }
    } catch (error) {
      console.error('Error batch generating questions:', error);
      alert('Error generating questions. Please check your API key and credits.');
    } finally {
      setGenerating(false);
    }
  };

  const approveQuestion = async (generationId) => {
    try {
      await axios.post(`${API_BASE_URL}/llm-generations/${generationId}/approve/`);
      fetchGenerations();
      fetchStats();
    } catch (error) {
      console.error('Error approving question:', error);
    }
  };

  const rejectQuestion = async (generationId) => {
    try {
      await axios.post(`${API_BASE_URL}/llm-generations/${generationId}/reject/`);
      fetchGenerations();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting question:', error);
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'technical': return <SmartToy />;
      case 'behavioral': return <Psychology />;
      case 'situational': return <QuestionAnswer />;
      case 'problem_solving': return <TrendingUp />;
      default: return <QuestionAnswer />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color="primary" />
        LLM Question Generator
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Prompts
              </Typography>
              <Typography variant="h4">{stats.totalPrompts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Generations
              </Typography>
              <Typography variant="h4">{stats.totalGenerations}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Questions
              </Typography>
              <Typography variant="h4" color="success.main">{stats.approvedQuestions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Review
              </Typography>
              <Typography variant="h4" color="warning.main">{stats.pendingReview}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Generation Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Questions
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Prompt Template</InputLabel>
                  <Select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    label="Prompt Template"
                  >
                    {prompts.map((prompt) => (
                      <MenuItem key={prompt.id} value={prompt.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTypeIcon(prompt.question_type)}
                          {prompt.name}
                          <Chip 
                            label={prompt.difficulty} 
                            size="small" 
                            color={getDifficultyColor(prompt.difficulty)}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Skill"
                  value={generationParams.skill}
                  onChange={(e) => setGenerationParams(prev => ({ ...prev, skill: e.target.value }))}
                  placeholder="e.g., python, react, leadership"
                  fullWidth
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Level</InputLabel>
                      <Select
                        value={generationParams.level}
                        onChange={(e) => setGenerationParams(prev => ({ ...prev, level: e.target.value }))}
                        label="Level"
                      >
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={generationParams.type}
                        onChange={(e) => setGenerationParams(prev => ({ ...prev, type: e.target.value }))}
                        label="Type"
                      >
                        <MenuItem value="technical">Technical</MenuItem>
                        <MenuItem value="behavioral">Behavioral</MenuItem>
                        <MenuItem value="situational">Situational</MenuItem>
                        <MenuItem value="problem_solving">Problem Solving</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <TextField
                  label="Context (Optional)"
                  value={generationParams.context}
                  onChange={(e) => setGenerationParams(prev => ({ ...prev, context: e.target.value }))}
                  placeholder="Additional context for question generation"
                  multiline
                  rows={2}
                  fullWidth
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Count"
                      type="number"
                      value={generationParams.count}
                      onChange={(e) => setGenerationParams(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                      inputProps={{ min: 1, max: 10 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={generationParams.autoApprove}
                          onChange={(e) => setGenerationParams(prev => ({ ...prev, autoApprove: e.target.checked }))}
                        />
                      }
                      label="Auto-approve"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={generateQuestions}
                    disabled={generating || !selectedPrompt}
                    startIcon={generating ? <CircularProgress size={20} /> : <Add />}
                    fullWidth
                  >
                    {generating ? 'Generating...' : 'Generate Single'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={batchGenerate}
                    disabled={generating || !selectedPrompt}
                    startIcon={generating ? <CircularProgress size={20} /> : <Refresh />}
                    fullWidth
                  >
                    {generating ? 'Generating...' : 'Batch Generate'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Generations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Generations
              </Typography>

              {loading ? (
                <LinearProgress />
              ) : (
                <List>
                  {generations.slice(0, 5).map((generation) => (
                    <React.Fragment key={generation.id}>
                      <ListItem>
                        <ListItemIcon>
                          {generation.status === 'added_to_bank' ? (
                            <CheckCircle color="success" />
                          ) : generation.status === 'pending_review' ? (
                            <Warning color="warning" />
                          ) : (
                            <Info color="info" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={generation.generated_question}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Quality: {generation.quality_score}/10
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Status: {generation.status.replace('_', ' ')}
                              </Typography>
                            </Box>
                          }
                        />
                        {generation.status === 'pending_review' && (
                          <Box>
                            <IconButton
                              color="success"
                              onClick={() => approveQuestion(generation.id)}
                              size="small"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => rejectQuestion(generation.id)}
                              size="small"
                            >
                              <Warning />
                            </IconButton>
                          </Box>
                        )}
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recently Generated Questions
                </Typography>
                <List>
                  {generatedQuestions.map((question, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <QuestionAnswer color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={question.question_text}
                        secondary={
                          <Box>
                            <Chip 
                              label={question.question_type} 
                              size="small" 
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={question.difficulty} 
                              size="small" 
                              color={getDifficultyColor(question.difficulty)}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Prompt Templates */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Available Prompt Templates</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {prompts.map((prompt) => (
                  <Grid item xs={12} sm={6} md={4} key={prompt.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {prompt.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {prompt.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={prompt.question_type} 
                          size="small" 
                          icon={getTypeIcon(prompt.question_type)}
                        />
                        <Chip 
                          label={prompt.difficulty} 
                          size="small" 
                          color={getDifficultyColor(prompt.difficulty)}
                        />
                      </Box>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Target Skills: {prompt.target_skills.join(', ')}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> This system uses o1-mini for cost-effective question generation. 
          Make sure you have sufficient OpenAI credits. Questions are automatically quality-assessed 
          and can be auto-approved based on quality scores.
        </Typography>
      </Alert>
    </Box>
  );
};

export default LLMQuestionGenerator; 
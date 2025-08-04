import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { competencyService } from '../../services/competencyService';

const InterviewTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    framework: null,
    duration_minutes: 60,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, frameworksData] = await Promise.all([
        competencyService.getTemplates(),
        competencyService.getFrameworks()
      ]);
      setTemplates(templatesData);
      setFrameworks(frameworksData);
    } catch (err) {
      setError('Failed to load interview templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      framework: null,
      duration_minutes: 60,
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      framework: template.framework,
      duration_minutes: template.duration_minutes,
      is_active: template.is_active
    });
    setDialogOpen(true);
  };

  const handleView = async (template) => {
    try {
      // Load detailed template data including questions
      const [templateDetails, questions] = await Promise.all([
        competencyService.getTemplate(template.id),
        competencyService.getQuestions(template.id)
      ]);
      
      setViewingTemplate({
        ...templateDetails,
        questions: questions
      });
      setViewDialogOpen(true);
    } catch (err) {
      setError('Failed to load template details');
      console.error(err);
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this interview template?')) {
      try {
        await competencyService.deleteTemplate(templateId);
        await loadData();
      } catch (err) {
        setError('Failed to delete template');
        console.error(err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        framework: formData.framework?.id || formData.framework
      };

      if (editingTemplate) {
        await competencyService.updateTemplate(editingTemplate.id, submitData);
      } else {
        await competencyService.createTemplate(submitData);
      }
      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError('Failed to save template');
      console.error(err);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <ScheduleIcon sx={{ mr: 1 }} />
          Interview Templates ({templates.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create Template
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {template.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary" onClick={() => handleView(template)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Template">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(template)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Template">
                      <IconButton size="small" color="error" onClick={() => handleDelete(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={template.framework?.name || 'No Framework'} 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                  />
                  <Chip 
                    label={formatDuration(template.duration_minutes)} 
                    size="small" 
                    color="info"
                  />
                  <Chip 
                    label={template.is_active ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={template.is_active ? 'success' : 'default'}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {template.questions_count || 0} questions • Created {new Date(template.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Interview Template' : 'Create New Interview Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Python Developer Interview, Senior Java Assessment"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Describe the interview template and its purpose..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={frameworks}
                  getOptionLabel={(option) => option.name}
                  value={formData.framework}
                  onChange={(event, newValue) => setFormData({ ...formData, framework: newValue })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Competency Framework"
                      placeholder="Select framework..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (minutes)"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  inputProps={{ min: 15, max: 480 }}
                  helperText="Expected interview duration in minutes"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Active Template"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Template Details: {viewingTemplate?.name}
        </DialogTitle>
        <DialogContent>
          {viewingTemplate && (
            <Box sx={{ pt: 1 }}>
              {/* Template Overview */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Overview</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Framework:</strong> {viewingTemplate.framework?.name || 'No Framework'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Duration:</strong> {formatDuration(viewingTemplate.duration_minutes)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {viewingTemplate.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Created:</strong> {new Date(viewingTemplate.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Updated:</strong> {new Date(viewingTemplate.updated_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {viewingTemplate.description}
                </Typography>
              </Box>

              {/* Interview Questions */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Interview Questions ({viewingTemplate.questions?.length || 0})
                </Typography>
                {viewingTemplate.questions && viewingTemplate.questions.length > 0 ? (
                  <Grid container spacing={2}>
                    {viewingTemplate.questions.map((question) => (
                      <Grid item xs={12} key={question.id}>
                        <Card variant="outlined">
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {question.question_text}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                  label={question.competency?.name || 'No Competency'} 
                                  size="small" 
                                  variant="outlined"
                                  color="primary"
                                />
                                <Chip 
                                  label={question.question_type} 
                                  size="small" 
                                  variant="outlined"
                                />
                                <Chip 
                                  label={question.difficulty} 
                                  size="small" 
                                  color={question.difficulty === 'hard' ? 'error' : question.difficulty === 'medium' ? 'warning' : 'success'}
                                />
                              </Box>
                            </Box>
                            {question.expected_answer && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                <strong>Expected Answer:</strong> {question.expected_answer}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No interview questions created for this template.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewTemplateList; 
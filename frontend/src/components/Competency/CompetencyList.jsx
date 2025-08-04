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
  Star as StarIcon
} from '@mui/icons-material';
import { competencyService } from '../../services/competencyService';

const CompetencyList = () => {
  const [competencies, setCompetencies] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCompetency, setViewingCompetency] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    weight: 5,
    order: 0,
    framework: null,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [competenciesData, frameworksData] = await Promise.all([
        competencyService.getCompetencies(),
        competencyService.getFrameworks()
      ]);
      setCompetencies(competenciesData);
      setFrameworks(frameworksData);
    } catch (err) {
      setError('Failed to load competencies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingCompetency(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      weight: 5,
      order: 0,
      framework: null,
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (competency) => {
    setEditingCompetency(competency);
    setFormData({
      name: competency.name,
      description: competency.description,
      category: competency.category,
      weight: competency.weight,
      order: competency.order,
      framework: competency.framework,
      is_active: competency.is_active
    });
    setDialogOpen(true);
  };

  const handleView = async (competency) => {
    try {
      // Load detailed competency data including questions
      const [competencyDetails, questions] = await Promise.all([
        competencyService.getCompetency(competency.id),
        competencyService.getQuestions()
      ]);
      
      // Filter questions for this competency
      const competencyQuestions = questions.filter(q => q.competency === competency.id);
      
      setViewingCompetency({
        ...competencyDetails,
        questions: competencyQuestions
      });
      setViewDialogOpen(true);
    } catch (err) {
      setError('Failed to load competency details');
      console.error(err);
    }
  };

  const handleDelete = async (competencyId) => {
    if (window.confirm('Are you sure you want to delete this competency?')) {
      try {
        await competencyService.deleteCompetency(competencyId);
        await loadData();
      } catch (err) {
        setError('Failed to delete competency');
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

      if (editingCompetency) {
        await competencyService.updateCompetency(editingCompetency.id, submitData);
      } else {
        await competencyService.createCompetency(submitData);
      }
      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError('Failed to save competency');
      console.error(err);
    }
  };

  const getWeightColor = (weight) => {
    if (weight >= 8) return 'error';
    if (weight >= 6) return 'warning';
    if (weight >= 4) return 'primary';
    return 'success';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Core': 'primary',
      'Advanced': 'warning',
      'Best Practices': 'success',
      'Architecture': 'error',
      'Testing': 'info'
    };
    return colors[category] || 'default';
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
          <StarIcon sx={{ mr: 1 }} />
          Competencies ({competencies.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create Competency
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Competencies Grid */}
      <Grid container spacing={3}>
        {competencies.map((competency) => (
          <Grid item xs={12} md={6} lg={4} key={competency.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {competency.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary" onClick={() => handleView(competency)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Competency">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(competency)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Competency">
                      <IconButton size="small" color="error" onClick={() => handleDelete(competency.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {competency.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={competency.framework?.name || 'No Framework'} 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                  />
                  <Chip 
                    label={competency.category} 
                    size="small" 
                    color={getCategoryColor(competency.category)}
                  />
                  <Chip 
                    label={`Weight: ${competency.weight}`} 
                    size="small" 
                    color={getWeightColor(competency.weight)}
                  />
                  <Chip 
                    label={competency.is_active ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={competency.is_active ? 'success' : 'default'}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Order: {competency.order} • Created {new Date(competency.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCompetency ? 'Edit Competency' : 'Create New Competency'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Competency Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Python Basics, OOP, Exception Handling"
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
                  placeholder="Describe what this competency covers..."
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
                      label="Framework"
                      placeholder="Select framework..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="Core">Core</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                    <MenuItem value="Best Practices">Best Practices</MenuItem>
                    <MenuItem value="Architecture">Architecture</MenuItem>
                    <MenuItem value="Testing">Testing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Weight (1-10)"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Display Order"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  inputProps={{ min: 0 }}
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
                  label="Active Competency"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCompetency ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Competency Details: {viewingCompetency?.name}
        </DialogTitle>
        <DialogContent>
          {viewingCompetency && (
            <Box sx={{ pt: 1 }}>
              {/* Competency Overview */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Overview</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Framework:</strong> {viewingCompetency.framework?.name || 'No Framework'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Category:</strong> {viewingCompetency.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Weight:</strong> {viewingCompetency.weight}/10
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Display Order:</strong> {viewingCompetency.order}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {viewingCompetency.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Created:</strong> {new Date(viewingCompetency.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {viewingCompetency.description}
                </Typography>
              </Box>

              {/* Interview Questions */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Interview Questions ({viewingCompetency.questions?.length || 0})
                </Typography>
                {viewingCompetency.questions && viewingCompetency.questions.length > 0 ? (
                  <Grid container spacing={2}>
                    {viewingCompetency.questions.map((question) => (
                      <Grid item xs={12} key={question.id}>
                        <Card variant="outlined">
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {question.question_text}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
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
                    No interview questions created for this competency.
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

export default CompetencyList; 
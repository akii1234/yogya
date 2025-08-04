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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Add as Add,
  Edit as Edit,
  Delete as Delete,
  Visibility as Visibility
} from '@mui/icons-material';
import { competencyService } from '../../services/competencyService';

const CompetencyFrameworkList = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingFramework, setViewingFramework] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
    level: 'mid',
    is_active: true
  });

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      const data = await competencyService.getFrameworks();
      setFrameworks(data);
    } catch (err) {
      setError('Failed to load competency frameworks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingFramework(null);
    setFormData({
      name: '',
      description: '',
      technology: '',
      level: 'mid',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (framework) => {
    setEditingFramework(framework);
    setFormData({
      name: framework.name,
      description: framework.description,
      technology: framework.technology,
      level: framework.level,
      is_active: framework.is_active
    });
    setDialogOpen(true);
  };

  const handleView = async (frameworkId) => {
    try {
      // Load detailed framework data including competencies and templates
      const [frameworkDetails, competencies, templates] = await Promise.all([
        competencyService.getFramework(frameworkId),
        competencyService.getCompetencies({ framework: frameworkId }),
        competencyService.getTemplates({ framework: frameworkId })
      ]);

      setViewingFramework({
        ...frameworkDetails,
        competencies: competencies,
        templates: templates
      });
      setViewDialogOpen(true);
    } catch (err) {
      console.error('Error loading framework details:', err);
      setError('Failed to load framework details');
    }
  };

  const handleDelete = async (frameworkId) => {
    if (window.confirm('Are you sure you want to delete this framework?')) {
      try {
        await competencyService.deleteFramework(frameworkId);
        loadFrameworks();
      } catch (err) {
        setError('Failed to delete framework');
        console.error(err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingFramework) {
        await competencyService.updateFramework(editingFramework.id, formData);
      } else {
        await competencyService.createFramework(formData);
      }
      setDialogOpen(false);
      loadFrameworks();
    } catch (err) {
      setError('Failed to save framework');
      console.error(err);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'junior': return 'info';
      case 'mid': return 'primary';
      case 'senior': return 'secondary';
      case 'lead': return 'warning';
      default: return 'default';
    }
  };

  const getWeightColor = (weight) => {
    if (weight >= 8) return 'error';
    if (weight >= 6) return 'warning';
    if (weight >= 4) return 'primary';
    return 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} sx={{ color: '#D32F2F' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with FAB-style Create Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        padding: '16px 0'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#212121',
            fontWeight: 700,
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <AssessmentIcon sx={{ mr: 1, color: '#D32F2F' }} />
          Competency Frameworks ({frameworks.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
          sx={{
            backgroundColor: '#D32F2F',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.025em',
            textTransform: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            height: '36px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#B71C1C',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(211, 47, 47, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
            },
          }}
        >
          + Create New Framework
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {/* Frameworks Grid - Figma Style */}
      <Grid container spacing={2}>
        {frameworks.map((framework) => (
          <Grid item xs={12} md={6} lg={4} key={framework.id}>
            <Card
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
                border: 'none',
                transition: 'all 0.2s ease-in-out',
                maxWidth: '600px',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ padding: '16px' }}>
                {/* Framework Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  mb: 2 
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#212121',
                      fontWeight: 700,
                      fontSize: '16px',
                      letterSpacing: '-0.025em',
                      lineHeight: 1.4,
                      fontFamily: 'Inter, sans-serif',
                      flex: 1,
                      mr: 2
                    }}
                  >
                    {framework.name}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#616161',
                    fontSize: '14px',
                    fontWeight: 400,
                    fontFamily: 'Inter, sans-serif',
                    mb: 2,
                    lineHeight: 1.5
                  }}
                >
                  {framework.description}
                </Typography>

                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={framework.technology} 
                    size="small" 
                    variant="outlined" 
                    sx={{
                      borderRadius: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#f2f2f2',
                      color: '#212121',
                      fontSize: '12px',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif',
                      border: 'none'
                    }}
                  />
                  <Chip 
                    label={framework.level} 
                    size="small" 
                    color={getLevelColor(framework.level)}
                    sx={{
                      borderRadius: '12px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                  <Chip 
                    label={framework.is_active ? 'Active' : 'Inactive'} 
                    size="small" 
                    sx={{
                      borderRadius: '12px',
                      padding: '4px 8px',
                      backgroundColor: framework.is_active ? '#388E3C' : '#9E9E9E',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleView(framework.id)}
                    sx={{
                      border: '1px solid #D32F2F',
                      color: '#D32F2F',
                      backgroundColor: 'transparent',
                      fontWeight: 700,
                      fontSize: '14px',
                      letterSpacing: '0.025em',
                      textTransform: 'none',
                      borderRadius: '8px',
                      height: '36px',
                      padding: '0 12px',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#D32F2F',
                        color: '#FFFFFF',
                        borderColor: '#D32F2F',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                      },
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(framework)}
                    sx={{
                      border: '1px solid #BDBDBD',
                      color: '#212121',
                      backgroundColor: 'transparent',
                      fontWeight: 700,
                      fontSize: '14px',
                      letterSpacing: '0.025em',
                      textTransform: 'none',
                      borderRadius: '8px',
                      height: '36px',
                      padding: '0 12px',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                        borderColor: '#9E9E9E',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(framework.id)}
                    sx={{
                      border: '1px solid #D32F2F',
                      color: '#D32F2F',
                      backgroundColor: 'transparent',
                      fontWeight: 700,
                      fontSize: '14px',
                      letterSpacing: '0.025em',
                      textTransform: 'none',
                      borderRadius: '8px',
                      height: '36px',
                      padding: '0 12px',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#D32F2F',
                        color: '#FFFFFF',
                        borderColor: '#D32F2F',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                      },
                    }}
                  >
                    Delete
                  </Button>
                </Box>

                {/* Footer Timestamp */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#9E9E9E',
                    fontSize: '12px',
                    fontWeight: 300,
                    fontFamily: 'Inter, sans-serif',
                    display: 'block',
                    mt: 2,
                    textAlign: 'right'
                  }}
                >
                  Created: {new Date(framework.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          color: '#212121',
          fontWeight: 700,
          fontSize: '18px',
          fontFamily: 'Inter, sans-serif',
          padding: '24px 24px 16px 24px'
        }}>
          {editingFramework ? 'Edit Framework' : 'Create New Framework'}
        </DialogTitle>
        <DialogContent sx={{ padding: '0 24px 16px 24px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Framework Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }
              }}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }
              }}
            />
            <TextField
              label="Technology"
              value={formData.technology}
              onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Level</InputLabel>
              <Select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                sx={{
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }}
              >
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="mid">Mid</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#212121'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px 24px 24px' }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{
              color: '#757575',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.025em',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              height: '36px',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#F5F5F5',
                color: '#212121',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              backgroundColor: '#D32F2F',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.025em',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              height: '36px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#B71C1C',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(211, 47, 47, 0.4)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
              },
            }}
          >
            {editingFramework ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          color: '#212121',
          fontWeight: 700,
          fontSize: '18px',
          fontFamily: 'Inter, sans-serif',
          padding: '24px 24px 16px 24px'
        }}>
          Framework Details: {viewingFramework?.name}
        </DialogTitle>
        <DialogContent sx={{ padding: '0 24px 16px 24px' }}>
          {viewingFramework && (
            <Box sx={{ pt: 1 }}>
              {/* Framework Overview */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  color: '#212121',
                  fontWeight: 700,
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ 
                      mb: 1,
                      color: '#616161',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <strong>Technology:</strong> {viewingFramework.technology}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 1,
                      color: '#616161',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <strong>Level:</strong> {viewingFramework.level}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 1,
                      color: '#616161',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <strong>Status:</strong> {viewingFramework.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ 
                      mb: 1,
                      color: '#616161',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <strong>Created:</strong> {new Date(viewingFramework.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mb: 1,
                      color: '#616161',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <strong>Updated:</strong> {new Date(viewingFramework.updated_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body1" sx={{ 
                  mt: 2,
                  color: '#212121',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1.5
                }}>
                  {viewingFramework.description}
                </Typography>
              </Box>

              {/* Competencies */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  color: '#212121',
                  fontWeight: 700,
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Competencies ({viewingFramework.competencies?.length || 0})
                </Typography>
                {viewingFramework.competencies && viewingFramework.competencies.length > 0 ? (
                  <Grid container spacing={2}>
                    {viewingFramework.competencies.map((competency) => (
                      <Grid item xs={12} md={6} key={competency.id}>
                        <Card variant="outlined" sx={{ borderRadius: '8px' }}>
                          <CardContent sx={{ py: 2, px: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 700,
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                color: '#212121'
                              }}>
                                {competency.name}
                              </Typography>
                              <Chip 
                                label={`Weight: ${competency.weight}`} 
                                size="small" 
                                color={getWeightColor(competency.weight)}
                                sx={{
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  fontFamily: 'Inter, sans-serif'
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ 
                              mb: 1,
                              color: '#616161',
                              fontSize: '14px',
                              fontFamily: 'Inter, sans-serif'
                            }}>
                              {competency.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={competency.category} 
                                size="small" 
                                variant="outlined"
                                sx={{
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  fontFamily: 'Inter, sans-serif'
                                }}
                              />
                              <Chip 
                                label={`Order: ${competency.order}`} 
                                size="small" 
                                variant="outlined"
                                sx={{
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  fontFamily: 'Inter, sans-serif'
                                }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ 
                    color: '#616161',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    No competencies defined for this framework.
                  </Typography>
                )}
              </Box>

              {/* Interview Templates */}
              <Box>
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  color: '#212121',
                  fontWeight: 700,
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Interview Templates ({viewingFramework.templates?.length || 0})
                </Typography>
                {viewingFramework.templates && viewingFramework.templates.length > 0 ? (
                  <Grid container spacing={2}>
                    {viewingFramework.templates.map((template) => (
                      <Grid item xs={12} md={6} key={template.id}>
                        <Card variant="outlined" sx={{ borderRadius: '8px' }}>
                          <CardContent sx={{ py: 2, px: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 700,
                              fontSize: '14px',
                              fontFamily: 'Inter, sans-serif',
                              color: '#212121',
                              mb: 1
                            }}>
                              {template.name}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              mb: 1,
                              color: '#616161',
                              fontSize: '14px',
                              fontFamily: 'Inter, sans-serif'
                            }}>
                              Duration: {template.duration} minutes
                            </Typography>
                            <Chip 
                              label={template.is_active ? 'Active' : 'Inactive'} 
                              size="small" 
                              sx={{
                                borderRadius: '12px',
                                backgroundColor: template.is_active ? '#388E3C' : '#9E9E9E',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 500,
                                fontFamily: 'Inter, sans-serif'
                              }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ 
                    color: '#616161',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    No interview templates defined for this framework.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px 24px 24px' }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            sx={{
              backgroundColor: '#D32F2F',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.025em',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              height: '36px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#B71C1C',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(211, 47, 47, 0.4)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetencyFrameworkList; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { searchJobs } from '../../services/candidateService';

const JobBrowse = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For demo purposes, using a mock candidate ID
  const candidateId = 1;

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading jobs for candidate:', candidateId);
      const data = await searchJobs({ candidateId });
      console.log('📊 Jobs loaded:', data);
      setJobs(data);
    } catch (error) {
      console.error('❌ Error loading jobs:', error);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMatchLevelColor = (level) => {
    switch (level) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'primary';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMatchLevelText = (level) => {
    switch (level) {
      case 'excellent':
        return 'Excellent Match';
      case 'good':
        return 'Good Match';
      case 'fair':
        return 'Fair Match';
      case 'poor':
        return 'Poor Match';
      default:
        return 'No Match Data';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={loadJobs}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Browse Jobs
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
      </Typography>

      {jobs.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {jobs.map((job, index) => (
            <Grid item xs={12} md={6} lg={4} key={job.id || index}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Match Score Header */}
                  {job.match_score !== null && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Your Match Score:
                        </Typography>
                        <Chip
                          icon={<StarIcon />}
                          label={`${job.match_score}%`}
                          color={getMatchLevelColor(job.match_level)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {getMatchLevelText(job.match_level)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={job.match_score}
                          sx={{ 
                            width: '60%', 
                            height: 6, 
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: job.match_score >= 80 ? '#4caf50' : 
                                             job.match_score >= 60 ? '#2196f3' : 
                                             job.match_score >= 40 ? '#ff9800' : '#f44336'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Typography variant="h6" component="h3" gutterBottom>
                    {job.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {job.company} • {job.location}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {job.min_experience_years || 0}+ years experience
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {job.description?.substring(0, 120)}...
                  </Typography>

                  {/* Skills */}
                  {job.extracted_skills && job.extracted_skills.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Key Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {job.extracted_skills.slice(0, 3).map((skill, skillIndex) => (
                          <Chip key={skillIndex} label={skill} size="small" variant="outlined" />
                        ))}
                        {job.extracted_skills.length > 3 && (
                          <Chip label={`+${job.extracted_skills.length - 3} more`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 'auto' }}
                    disabled={job.match_score !== null && job.match_score < 30}
                  >
                    {job.match_score !== null && job.match_score < 30 ? 'Low Match Score' : 'Apply Now'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No jobs found. Please check back later.
        </Typography>
      )}
    </Box>
  );
};

export default JobBrowse; 
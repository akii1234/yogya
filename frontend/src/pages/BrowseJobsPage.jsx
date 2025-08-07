import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { Search, Work, LocationOn, Business, Star } from '@mui/icons-material';
import api from '../services/api';

const BrowseJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [sortBy, setSortBy] = useState('match_score'); // Default sort by match score

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching jobs from candidate portal...');
      const response = await api.get('/candidate-portal/browse-jobs/');
      console.log('✅ Jobs response:', response.data);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
                           job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesExperience = !experienceFilter || 
                             job.experience_level === experienceFilter;
    
    return matchesSearch && matchesLocation && matchesExperience;
  });

  const handleApply = async (jobId) => {
    try {
      await api.post('/candidate-portal/apply-job/', { job_id: jobId });
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const sortJobs = (jobsToSort) => {
    const sortedJobs = [...jobsToSort];
    
    switch (sortBy) {
      case 'match_score':
        // Sort by match score (high to low), then by title
        sortedJobs.sort((a, b) => {
          const scoreA = a.match_score ?? 0;
          const scoreB = b.match_score ?? 0;
          if (scoreB !== scoreA) {
            return scoreB - scoreA; // High to low
          }
          return (a.title || '').localeCompare(b.title || '');
        });
        break;
      case 'title':
        // Sort alphabetically by title
        sortedJobs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'company':
        // Sort alphabetically by company
        sortedJobs.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
        break;
      case 'location':
        // Sort alphabetically by location
        sortedJobs.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
      case 'experience':
        // Sort by experience requirement (low to high)
        sortedJobs.sort((a, b) => {
          const expA = a.min_experience_years ?? 0;
          const expB = b.min_experience_years ?? 0;
          return expA - expB;
        });
        break;
      default:
        // Default to match score sorting
        sortedJobs.sort((a, b) => {
          const scoreA = a.match_score ?? 0;
          const scoreB = b.match_score ?? 0;
          return scoreB - scoreA;
        });
    }
    
    return sortedJobs;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', px: 3, py: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#212121',
          mb: 3,
        }}
      >
        Browse Jobs
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#757575' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: '#757575' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={experienceFilter}
                label="Experience Level"
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior Level</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="match_score">Match Score (High to Low)</MenuItem>
                <MenuItem value="title">Job Title (A-Z)</MenuItem>
                <MenuItem value="company">Company (A-Z)</MenuItem>
                <MenuItem value="location">Location (A-Z)</MenuItem>
                <MenuItem value="experience">Experience (Low to High)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Jobs List */}
      <Grid container spacing={3}>
        {sortJobs(filteredJobs).map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job.id}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 2,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Business sx={{ mr: 1, color: '#757575' }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#757575', fontWeight: 500 }}
                  >
                    {job.company || 'Company Name'}
                  </Typography>
                </Box>
                
                {/* Match Score Display */}
                {job.match_score !== null && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Your Match Score:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star 
                          sx={{ 
                            color: job.match_score >= 80 ? '#4CAF50' : 
                                  job.match_score >= 50 ? '#FF9800' : '#F44336',
                            fontSize: 20 
                          }} 
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: job.match_score >= 80 ? '#4CAF50' : 
                                  job.match_score >= 50 ? '#FF9800' : '#F44336'
                          }}
                        >
                          {job.match_score.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600,
                          color: job.match_score >= 80 ? '#4CAF50' : 
                                job.match_score >= 50 ? '#FF9800' : '#F44336'
                        }}
                      >
                        {job.match_score >= 80 ? 'Excellent Match' : 
                         job.match_score >= 50 ? 'Good Match' : 'Poor Match'}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={job.match_score}
                        sx={{ 
                          width: '60%', 
                          height: 6, 
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: job.match_score >= 80 ? '#4CAF50' : 
                                           job.match_score >= 50 ? '#FF9800' : '#F44336'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                )}
                
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#212121',
                    mb: 1,
                  }}
                >
                  {job.title || 'Job Title'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: '#757575', fontSize: 16 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#757575' }}
                  >
                    {job.location || 'Location'}
                  </Typography>
                </Box>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: '#616161',
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {job.description || 'Job description will appear here...'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {job.experience_level && (
                    <Chip
                      label={job.experience_level}
                      size="small"
                      sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
                    />
                  )}
                  {job.department && (
                    <Chip
                      label={job.department}
                      size="small"
                      sx={{ backgroundColor: '#F3E5F5', color: '#7B1FA2' }}
                    />
                  )}
                                  </Box>
                  
                  {/* Application Status Indicator */}
                  {job.has_applied && (
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      <Chip
                        label={`Applied on ${new Date(job.applied_at).toLocaleDateString()}`}
                        color="success"
                        variant="outlined"
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          borderColor: '#4CAF50',
                          color: '#4CAF50'
                        }}
                      />
                    </Box>
                  )}
                  
                  <Button
                  variant={job.has_applied ? "outlined" : "contained"}
                  fullWidth
                  disabled={job.has_applied}
                  onClick={() => handleApply(job.id)}
                  sx={{
                    mt: 'auto',
                    fontWeight: 600,
                    ...(job.has_applied && {
                      color: '#4CAF50',
                      borderColor: '#4CAF50',
                      '&:hover': {
                        borderColor: '#45a049',
                        backgroundColor: 'rgba(76, 175, 80, 0.04)'
                      }
                    })
                  }}
                >
                  {job.has_applied ? 'Already Applied' : 'Apply Now'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredJobs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Work sx={{ fontSize: 64, color: '#E0E0E0', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#757575', mb: 1 }}>
            No jobs found
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            Try adjusting your search criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BrowseJobsPage; 
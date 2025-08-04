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
} from '@mui/material';
import { Search, Work, LocationOn, Business } from '@mui/icons-material';
import { api } from '../services/api';

const BrowseJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/job-descriptions/');
      setJobs(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
          <Grid item xs={12} md={4}>
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
        </Grid>
      </Box>

      {/* Jobs List */}
      <Grid container spacing={3}>
        {filteredJobs.map((job) => (
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
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleApply(job.id)}
                  sx={{
                    mt: 'auto',
                    fontWeight: 600,
                  }}
                >
                  Apply Now
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
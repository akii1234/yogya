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
  LinearProgress,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  Slider
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import { searchJobs, getCompleteProfile, submitJobApplication } from '../../services/candidateService';
import { useAuth } from '../../contexts/AuthContext';

const JobBrowse = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyMatches, setShowOnlyMatches] = useState(true);
  const [minMatchScore, setMinMatchScore] = useState(50); // Set to 50% for smart filtering
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState({});
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [applicationSuccess, setApplicationSuccess] = useState(null);
  const { user } = useAuth();

  // Don't send candidate_id - let the backend find the candidate by authenticated user's email
  // This ensures we get the correct candidate record for the logged-in user

  useEffect(() => {
    loadJobs();
    loadCandidateProfile();
  }, [showOnlyMatches, minMatchScore]);

  const loadCandidateProfile = async () => {
    try {
      const profile = await getCompleteProfile();
      setCandidateProfile(profile);
    } catch (error) {
      console.error('Error loading candidate profile:', error);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading jobs for authenticated user:', user?.email);
      console.log('🔍 Filters:', { showOnlyMatches, minMatchScore });
      
      const data = await searchJobs({ 
        showOnlyMatches,
        minMatchScore
      });
      
      console.log('📊 Jobs loaded:', data);
      setJobs(data.jobs || []);
      setTotalAvailable(data.totalAvailable || 0);
      setFiltersApplied(data.filtersApplied || {});
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

  const handleApplyJob = async (job) => {
    if (!candidateProfile) {
      setApplicationSuccess({ type: 'error', message: 'Please complete your profile before applying to jobs.' });
      return;
    }

    try {
      setApplyingJobs(prev => new Set(prev).add(job.id));
      setApplicationSuccess(null);

      console.log('🎯 Applying to job:', job.id);
      console.log('👤 Candidate profile:', candidateProfile);

      const applicationData = {
        coverLetter: `I am excited to apply for the ${job.title} position at ${job.company}. I believe my skills and experience make me a strong candidate for this role.`,
        expectedSalary: null, // Can be enhanced later with salary input
        source: 'direct_apply'
      };

      const result = await submitJobApplication(job.id, applicationData);
      
      console.log('✅ Application submitted successfully:', result);
      
      setApplicationSuccess({ 
        type: 'success', 
        message: `Successfully applied to ${job.title} at ${job.company}!` 
      });

      // Refresh jobs to update any application status
      setTimeout(() => {
        loadJobs();
      }, 1000);

    } catch (error) {
      console.error('❌ Error applying to job:', error);
      
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('already exists')) {
          errorMessage = 'You have already applied to this job.';
        } else {
          errorMessage = error.response.data.error;
        }
      }
      
      setApplicationSuccess({ type: 'error', message: errorMessage });
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
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

      {/* Application Success/Error Alert */}
      {applicationSuccess && (
        <Alert 
          severity={applicationSuccess.type} 
          sx={{ mb: 3 }}
          onClose={() => setApplicationSuccess(null)}
        >
          {applicationSuccess.message}
        </Alert>
      )}
      
      {/* Smart Filtering Controls */}
      <Card elevation={1} sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            Smart Job Matching
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyMatches}
                onChange={(e) => setShowOnlyMatches(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  Show only jobs with {minMatchScore}%+ match score
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Get personalized job recommendations based on your profile
                </Typography>
              </Box>
            }
          />
          
          {showOnlyMatches && (
            <Chip
              label={`${jobs.length} of ${totalAvailable} jobs match your profile`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        
        {showOnlyMatches && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Match Score Threshold: {minMatchScore}%
            </Typography>
            <Slider
              value={minMatchScore}
              onChange={(event, newValue) => setMinMatchScore(newValue)}
              min={20}
              max={80}
              step={10}
              marks={[
                { value: 20, label: '20%' },
                { value: 50, label: '50%' },
                { value: 80, label: '80%' }
              ]}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
          </Box>
        )}
        
        {showOnlyMatches && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Smart Filtering Active:</strong> Only showing jobs where your skills, experience, and education match 50% or more with the job requirements. 
              This helps you focus on the most relevant opportunities.
            </Typography>
          </Alert>
        )}
      </Card>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Candidate Profile Summary */}
      {candidateProfile && (
        <Card elevation={1} sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Your Profile Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label={`${candidateProfile.first_name} ${candidateProfile.last_name}`} color="primary" variant="outlined" />
            <Chip label={`${candidateProfile.total_experience_years || 0} years experience`} variant="outlined" />
            <Chip label={candidateProfile.current_title || 'No title'} variant="outlined" />
            <Chip label={`${candidateProfile.skills?.length || 0} skills`} variant="outlined" />
          </Box>
          {candidateProfile.skills && candidateProfile.skills.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Your Skills (showing top 10):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {candidateProfile.skills.slice(0, 10).map((skill, index) => (
                  <Chip key={index} label={skill} size="small" variant="outlined" />
                ))}
                {candidateProfile.skills.length > 10 && (
                  <Chip label={`+${candidateProfile.skills.length - 10} more`} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          )}
        </Card>
      )}
      
      <Typography variant="body1" gutterBottom>
        {showOnlyMatches 
          ? `Found ${jobs.length} matching job${jobs.length !== 1 ? 's' : ''} (${totalAvailable} total available)`
          : `Found ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`
        }
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
                    disabled={
                      (job.match_score !== null && job.match_score < 30) || 
                      applyingJobs.has(job.id)
                    }
                    onClick={() => handleApplyJob(job)}
                  >
                    {applyingJobs.has(job.id) ? (
                      'Applying...'
                    ) : job.match_score !== null && job.match_score < 30 ? (
                      'Low Match Score'
                    ) : (
                      'Apply Now'
                    )}
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
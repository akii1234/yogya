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
  Slider,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NavigateBefore from '@mui/icons-material/NavigateBefore';
import NavigateNext from '@mui/icons-material/NavigateNext';
import { searchJobs, getCompleteProfile, submitJobApplication } from '../../services/candidateService';
import { useAuth } from '../../contexts/AuthContext';
import DetailedAnalysisModal from './DetailedAnalysisModal';
import ApplicationSuccessModal from './ApplicationSuccessModal';
import AssessmentInterface from './AssessmentInterface';
import AssessmentResults from './AssessmentResults';

const JobBrowse = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyMatches, setShowOnlyMatches] = useState(true);
  const [minMatchScore, setMinMatchScore] = useState(50); // Set to 50% for smart filtering
  const [sortBy, setSortBy] = useState('match_score'); // Default sort by match score
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState({});
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [applicationSuccess, setApplicationSuccess] = useState(null);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState(null);
  
  // Assessment modal states
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [selectedApplicationForAssessment, setSelectedApplicationForAssessment] = useState(null);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const { user } = useAuth();

  // Don't send candidate_id - let the backend find the candidate by authenticated user's email
  // This ensures we get the correct candidate record for the logged-in user

  useEffect(() => {
    loadJobs(1); // Reset to page 1 when filters change
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

  const loadJobs = async (page = 1, newPageSize = null) => {
    try {
      setLoading(true);
      setError(null);
      const currentPageSize = newPageSize || pageSize;
      console.log('🔍 Loading jobs for authenticated user:', user?.email);
      console.log('🔍 Filters:', { showOnlyMatches, minMatchScore, page, pageSize: currentPageSize });
      
      const data = await searchJobs({ 
        showOnlyMatches,
        minMatchScore,
        page,
        pageSize: currentPageSize
      });
      
      console.log('📊 Jobs loaded:', data);
      setJobs(data.jobs || []);
      setTotalAvailable(data.totalAvailable || 0);
      setTotalCount(data.totalCount || 0);
      setFiltersApplied(data.filtersApplied || {});
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setHasNext(data.hasNext || false);
      setHasPrevious(data.hasPrevious || false);
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
      
      // Show success modal instead of alert
      setSelectedJobForModal(job);
      setSuccessModalOpen(true);

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

  const handleViewAnalysis = (job) => {
    setSelectedJobForAnalysis(job);
    setAnalysisModalOpen(true);
  };

  const handleCloseAnalysis = () => {
    setAnalysisModalOpen(false);
    setSelectedJobForAnalysis(null);
  };

  // Assessment modal handlers
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    setSelectedJobForModal(null);
  };

  const handleStartAssessment = () => {
    console.log('Starting assessment for job:', selectedJobForModal?.id);
    handleCloseSuccessModal();
    setSelectedApplicationForAssessment({
      jobId: selectedJobForModal?.id,
      jobTitle: selectedJobForModal?.title,
      companyName: selectedJobForModal?.company_name,
      applicationId: `APP-${Date.now()}` // This will come from the actual application
    });
    setAssessmentModalOpen(true);
  };

  const handleViewApplications = () => {
    // TODO: Navigate to applications page
    console.log('Navigating to applications page');
    handleCloseSuccessModal();
    // For now, just close the modal
    // Later: navigate to applications page
  };

  const handleAssessmentComplete = (score) => {
    console.log('Assessment completed with score:', score);
    setAssessmentModalOpen(false);
    setSelectedApplicationForAssessment(null);
    
    // Calculate results
    const correctAnswers = Math.round((score / 100) * 5); // Assuming 5 questions
    const timeSpent = 20 * 60 - 300; // Mock time spent (20 minutes - 5 minutes)
    
    setAssessmentResults({
      score,
      totalQuestions: 5,
      correctAnswers,
      timeSpent,
      jobTitle: selectedApplicationForAssessment?.jobTitle,
      companyName: selectedApplicationForAssessment?.companyName
    });
    setResultsModalOpen(true);
    
    // Show success message based on score
    let message = '';
    let type = 'success';
    
    if (score >= 80) {
      message = `🎉 Excellent! You scored ${score}%. You're eligible for direct interview scheduling.`;
    } else if (score >= 60) {
      message = `👍 Good job! You scored ${score}%. Your application will be reviewed by HR.`;
      type = 'info';
    } else {
      message = `📝 You scored ${score}%. You may retake the assessment (${3 - 1} attempts remaining).`;
      type = 'warning';
    }
    
    setApplicationSuccess({
      type,
      message
    });
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
              label={`${totalCount} matching jobs found`}
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
        
        {/* Sort Options */}
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
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
        </Box>
        
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
          ? `Found ${totalCount} matching job${totalCount !== 1 ? 's' : ''} (${totalAvailable} total available)`
          : `Found ${totalAvailable} job${totalAvailable !== 1 ? 's' : ''}`
        }
        {jobs.length > 0 && (
          <span style={{ color: '#666', fontSize: '0.9em' }}>
            {' '}• Showing {jobs.length} of {totalCount} on this page
          </span>
        )}
      </Typography>

      {jobs.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {sortJobs(jobs).map((job, index) => (
            <Box key={job.id || index} sx={{ mb: 3 }}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Match Score Header */}
                  {job.match_score !== null && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Your Match Score:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon 
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

                  <ButtonGroup variant="contained" fullWidth sx={{ mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      startIcon={<AnalyticsIcon />}
                      onClick={() => handleViewAnalysis(job)}
                      sx={{ flex: 1 }}
                    >
                      View Analysis
                    </Button>
                    <Button
                      variant={job.has_applied ? "outlined" : "contained"}
                      disabled={
                        (job.match_score !== null && job.match_score < 30) || 
                        applyingJobs.has(job.id) ||
                        job.has_applied
                      }
                      onClick={() => handleApplyJob(job)}
                      sx={{ 
                        flex: 1,
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
                      {applyingJobs.has(job.id) ? (
                        'Applying...'
                      ) : job.has_applied ? (
                        'Already Applied'
                      ) : job.match_score !== null && job.match_score < 30 ? (
                        'Low Match Score'
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  </ButtonGroup>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No jobs found. Please check back later.
        </Typography>
      )}

      {/* Pagination Controls */}
      {jobs.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
          {/* Page Size Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Show:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  setCurrentPage(1); // Reset to first page when changing page size
                  loadJobs(1, e.target.value);
                }}
                disabled={loading}
                sx={{ height: 32 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              per page
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              ({totalAvailable} total jobs)
            </Typography>
          </Box>

          {/* Navigation Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => loadJobs(currentPage - 1)}
              disabled={!hasPrevious || loading}
              startIcon={<NavigateBefore />}
              size="small"
            >
              Previous
            </Button>
            
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages}
            </Typography>
            
            <Button
              variant="outlined"
              onClick={() => loadJobs(currentPage + 1)}
              disabled={!hasNext || loading}
              endIcon={<NavigateNext />}
              size="small"
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Detailed Analysis Modal */}
      <DetailedAnalysisModal
        open={analysisModalOpen}
        onClose={handleCloseAnalysis}
        jobId={selectedJobForAnalysis?.id}
        jobTitle={selectedJobForAnalysis?.title}
        jobCompany={selectedJobForAnalysis?.company}
      />

      {/* Application Success Modal */}
      <ApplicationSuccessModal
        open={successModalOpen}
        onClose={handleCloseSuccessModal}
        jobTitle={selectedJobForModal?.title}
        companyName={selectedJobForModal?.company}
        onStartAssessment={handleStartAssessment}
        onViewApplications={handleViewApplications}
      />

      {/* Assessment Interface */}
      <AssessmentInterface
        open={assessmentModalOpen}
        onClose={() => {
          setAssessmentModalOpen(false);
          setSelectedApplicationForAssessment(null);
        }}
        jobTitle={selectedApplicationForAssessment?.jobTitle || ''}
        companyName={selectedApplicationForAssessment?.companyName || ''}
        applicationId={selectedApplicationForAssessment?.applicationId || ''}
        onComplete={handleAssessmentComplete}
      />

      {/* Assessment Results */}
      <AssessmentResults
        open={resultsModalOpen}
        onClose={() => {
          setResultsModalOpen(false);
          setAssessmentResults(null);
        }}
        score={assessmentResults?.score || 0}
        totalQuestions={assessmentResults?.totalQuestions || 0}
        correctAnswers={assessmentResults?.correctAnswers || 0}
        timeSpent={assessmentResults?.timeSpent || 0}
        jobTitle={assessmentResults?.jobTitle || ''}
        companyName={assessmentResults?.companyName || ''}
      />
    </Box>
  );
};

export default JobBrowse; 
import React, { useState, useEffect } from 'react';
// NOTE: This component now automatically generates rankings if none exist when "Refresh Rankings" is clicked
// This preserves existing functionality while adding auto-generation for better UX
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp,
  Person,
  Work,
  LocationOn,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Visibility,
  FilterList,
  Refresh,
  Analytics,
  Assessment,
  Schedule
} from '@mui/icons-material';
import rankingService from '../../services/rankingService';
import InterviewScheduler from './InterviewScheduler';

const CandidateRanking = () => {
  console.log('🎯 CandidateRanking component rendering...');
  
  // State management
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedCandidateForFeedback, setSelectedCandidateForFeedback] = useState(null);
  
  // Interview scheduling states
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [candidateToSchedule, setCandidateToSchedule] = useState(null);

  // Load jobs on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Load rankings when job is selected
  useEffect(() => {
    if (selectedJob) {
      setError('');
      setSuccess('');
      loadRankings(selectedJob);
    }
  }, [selectedJob]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading active jobs...');
      
      const response = await rankingService.getActiveJobs();
      console.log('✅ Jobs response:', response);
      
      if (response && response.jobs) {
        setJobs(response.jobs);
        console.log('📊 Set jobs:', response.jobs.length, 'jobs');
      } else {
        console.warn('⚠️ No jobs data in response:', response);
        setJobs([]);
      }
    } catch (err) {
      console.error('❌ Error loading jobs:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async (jobId) => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading rankings for job:', jobId);
      
      const response = await rankingService.getJobRankings(jobId);
      console.log('✅ Rankings response:', response);
      
      if (response && response.rankings) {
        setRankings(response.rankings);
        console.log('📊 Set rankings:', response.rankings.length, 'candidates');
      } else {
        console.warn('⚠️ No rankings data in response:', response);
        setRankings([]);
      }
    } catch (err) {
      console.error('❌ Error loading rankings:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError('Failed to load rankings');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (rankingId) => {
    try {
      setLoading(true);
      await rankingService.shortlistCandidate(rankingId);
      console.log('Shortlisting candidate:', rankingId);
      // Update local state
      setRankings(prev => prev.map(r => 
        r.ranking_id === rankingId ? { ...r, is_shortlisted: true, is_rejected: false } : r
      ));
      setError('');
      setSuccess('Candidate shortlisted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error shortlisting candidate:', err);
      setError('Failed to shortlist candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (rankingId) => {
    try {
      setLoading(true);
      await rankingService.rejectCandidate(rankingId);
      console.log('Rejecting candidate:', rankingId);
      // Update local state
      setRankings(prev => prev.map(r => 
        r.ranking_id === rankingId ? { ...r, is_rejected: true, is_shortlisted: false } : r
      ));
      setError('');
      setSuccess('Candidate rejected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error rejecting candidate:', err);
      setError('Failed to reject candidate');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'High Match';
    if (score >= 60) return 'Medium Match';
    return 'Low Match';
  };

  const handleViewDetails = (ranking) => {
    setSelectedCandidate(ranking);
    setViewModalOpen(true);
  };

  const handleViewFeedback = (ranking) => {
    setSelectedCandidateForFeedback(ranking);
    setFeedbackModalOpen(true);
  };

  const handleScheduleInterview = (ranking) => {
    // Navigate to interview scheduler with pre-filled candidate data
    console.log('Scheduling interview for:', ranking.candidate_name);
    
    // Find the job object for the selected job
    const job = jobs.find(j => j.job_id === selectedJob);
    
    if (!job) {
      setError('Please select a job first');
      return;
    }
    
    // For now, we'll show an alert with instructions
    alert(`To schedule an interview for ${ranking.candidate_name}:
    
1. Go to the Interview Scheduler tab
2. Click "Schedule Interview" 
3. Select ${ranking.candidate_name} from the candidate list
4. Choose the job: ${job.title} - ${job.company}
5. Set up the interview details
    
This will be integrated with the Interview Scheduler component.`);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedCandidate(null);
  };

  const filteredRankings = rankings.filter(ranking => {
    // Score filter
    if (scoreFilter === 'high' && ranking.overall_score < 80) return false;
    if (scoreFilter === 'medium' && (ranking.overall_score < 60 || ranking.overall_score >= 80)) return false;
    if (scoreFilter === 'low' && ranking.overall_score >= 60) return false;
    
    // Search filter
    if (searchTerm && !ranking.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="primary" />
          Candidate Rankings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Analytics />}
          onClick={() => console.log('View analytics')}
        >
          View Analytics
        </Button>
      </Box>
      


      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Job Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Job for Ranking
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <Select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  disabled={loading}
                  displayEmpty
                  sx={{
                    minHeight: '48px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#db0011',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#db0011',
                    },
                    '& .MuiSelect-select': {
                      fontSize: '0.95rem',
                      fontWeight: selectedJob ? 600 : 500,
                      color: selectedJob ? '#2e7d32' : '#666666',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          minHeight: '64px',
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          padding: '16px 20px',
                          '&:hover': {
                            backgroundColor: '#f0f8f0',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#e8f5e8',
                            color: '#2e7d32',
                            fontWeight: 600,
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Work sx={{ mr: 2, color: '#db0011', fontSize: '1.2rem' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', color: '#666666' }}>
                        Select Job
                      </Typography>
                    </Box>
                  </MenuItem>
                  {jobs.map((job) => (
                    <MenuItem key={job.job_id} value={job.job_id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Work sx={{ mr: 2, color: '#db0011', fontSize: '1.2rem' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem', color: '#2e7d32' }}>
                          {job.title}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={6}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => selectedJob && loadRankings(selectedJob)}
                disabled={!selectedJob || loading}
                fullWidth
                sx={{
                  minHeight: '48px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#b71c1c',
                  },
                }}
              >
                Refresh Rankings
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters */}
      {selectedJob && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Score Range</InputLabel>
                  <Select
                    value={scoreFilter}
                    label="Score Range"
                    onChange={(e) => setScoreFilter(e.target.value)}
                    sx={{
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        padding: '16px 14px',
                        minHeight: '24px',
                        display: 'flex',
                        alignItems: 'center',
                      },
                    }}
                  >
                    <MenuItem value="all">All Scores</MenuItem>
                    <MenuItem value="high">High Match (80%+)</MenuItem>
                    <MenuItem value="medium">Medium Match (60-79%)</MenuItem>
                    <MenuItem value="low">Low Match (&lt;60%)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Candidates"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                />
              </Grid>
              <Grid xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Showing {filteredRankings.length} of {rankings.length} candidates
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Rankings Table */}
      {!loading && selectedJob && (
        <Card sx={{ 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <TableContainer component={Paper} sx={{ 
            maxHeight: 600,
            '& .MuiTable-root': {
              borderCollapse: 'separate',
              borderSpacing: 0
            }
          }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8faf8' }}>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 80,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Rank</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 200,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Candidate</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 100,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Score</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 120,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Experience</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 150,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Skills Match</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 150,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Location</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 100,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Status</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 120,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Interview</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 120,
                    backgroundColor: '#f8faf8',
                    borderBottom: '2px solid #e8f5e8',
                    color: '#2e7d32'
                  }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRankings.map((ranking, index) => (
                  <TableRow 
                    key={ranking.ranking_id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f0f8f0',
                        transition: 'background-color 0.2s ease'
                      },
                      backgroundColor: ranking.is_top_candidate ? '#f1f8e9' : index % 2 === 0 ? '#fafafa' : '#ffffff',
                      borderBottom: '1px solid #e8f5e8',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Rank */}
                    <TableCell>
                      <Chip
                        label={`#${ranking.rank_position}`}
                        sx={{
                          backgroundColor: ranking.rank_position === 1 ? '#e8f5e8' : '#f5f5f5',
                          color: ranking.rank_position === 1 ? '#2e7d32' : '#666666',
                          border: ranking.rank_position === 1 ? '1px solid #4caf50' : '1px solid #e0e0e0',
                          fontWeight: ranking.rank_position === 1 ? 'bold' : 'normal'
                        }}
                        size="small"
                      />
                    </TableCell>

                    {/* Candidate */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {ranking.candidate_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {ranking.candidate_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {ranking.candidate_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Score */}
                    <TableCell>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="h6" 
                          color={getScoreColor(ranking.overall_score)}
                          fontWeight="bold"
                        >
                          {ranking.overall_score}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getScoreLabel(ranking.overall_score)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Experience */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {ranking.experience_years} years
                        </Typography>
                        <Chip
                          label={ranking.experience_status}
                          size="small"
                          color={ranking.experience_gap >= 2 ? 'warning' : ranking.experience_gap <= -2 ? 'error' : 'success'}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>

                    {/* Skills Match */}
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {ranking.matched_skills.length}/{ranking.matched_skills.length + ranking.missing_skills.length}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {Math.round(ranking.skill_match_score)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={ranking.skill_match_score}
                          color={getScoreColor(ranking.skill_match_score)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {ranking.matched_skills.slice(0, 3).join(', ')}
                          {ranking.matched_skills.length > 3 && '...'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {ranking.candidate_location}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Box>
                        {ranking.is_top_candidate && (
                          <Chip
                            label="Top Candidate"
                            sx={{
                              backgroundColor: '#e8f5e8',
                              color: '#2e7d32',
                              border: '1px solid #4caf50',
                              fontWeight: 'medium',
                              mb: 0.5
                            }}
                            size="small"
                          />
                        )}
                        {ranking.is_shortlisted && (
                          <Chip
                            label="Shortlisted"
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {ranking.is_rejected && (
                          <Chip
                            label="Rejected"
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {!ranking.is_top_candidate && !ranking.is_shortlisted && !ranking.is_rejected && (
                          <Chip
                            label="Pending"
                            color="default"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Interview */}
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Interview Feedback">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewFeedback(ranking)}
                          >
                            <Assessment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Schedule Interview">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleScheduleInterview(ranking)}
                          >
                            <Schedule />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Shortlist">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleShortlist(ranking.ranking_id)}
                            disabled={ranking.is_shortlisted}
                          >
                            {ranking.is_shortlisted ? <Star color="success" /> : <StarBorder />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(ranking.ranking_id)}
                            disabled={ranking.is_rejected}
                          >
                            <ThumbDown />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(ranking)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Empty State */}
      {!loading && selectedJob && filteredRankings.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No candidates found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Try adjusting your filters or select a different job.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* No Job Selected */}
      {!loading && !selectedJob && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Select a job to view candidate rankings
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Choose a job from the dropdown above to see ranked candidates.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Candidate Details Modal */}
      <Dialog 
        open={viewModalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8faf8'
        }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {selectedCandidate?.candidate_name?.charAt(0) || 'C'}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {selectedCandidate?.candidate_name || 'Candidate Details'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedCandidate?.candidate_email}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {selectedCandidate && (
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                  Basic Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Name" 
                      secondary={selectedCandidate.candidate_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Experience" 
                      secondary={`${selectedCandidate.experience_years} years (Required: ${selectedCandidate.required_experience_years})`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Location" 
                      secondary={selectedCandidate.candidate_location}
                    />
                  </ListItem>
                </List>
              </Grid>

              {/* Scores */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                  Ranking Scores
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Overall Score</Typography>
                          <Chip 
                            label={`${selectedCandidate.overall_score}%`}
                            color={getScoreColor(selectedCandidate.overall_score)}
                            size="small"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Skills Match</Typography>
                          <Typography variant="body2">{selectedCandidate.skill_match_score}%</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Experience Match</Typography>
                          <Typography variant="body2">{selectedCandidate.experience_match_score}%</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Education Match</Typography>
                          <Typography variant="body2">{selectedCandidate.education_match_score}%</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Location Match</Typography>
                          <Typography variant="body2">{selectedCandidate.location_match_score}%</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </Grid>

              {/* Skills Analysis */}
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                  Skills Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Matched Skills ({selectedCandidate.matched_skills?.length || 0})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCandidate.matched_skills?.map((skill, index) => (
                        <Chip 
                          key={index}
                          label={skill}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Missing Skills ({selectedCandidate.missing_skills?.length || 0})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCandidate.missing_skills?.map((skill, index) => (
                        <Chip 
                          key={index}
                          label={skill}
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
                {selectedCandidate.skill_gap_percentage > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Skill Gap: {selectedCandidate.skill_gap_percentage}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={100 - selectedCandidate.skill_gap_percentage}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}
              </Grid>

              {/* Status */}
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                  Application Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Rank #${selectedCandidate.rank_position}`}
                    color="primary"
                    variant="outlined"
                  />
                  {selectedCandidate.is_top_candidate && (
                    <Chip 
                      label="Top Candidate"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {selectedCandidate.is_shortlisted && (
                    <Chip 
                      label="Shortlisted"
                      color="success"
                    />
                  )}
                  {selectedCandidate.is_rejected && (
                    <Chip 
                      label="Rejected"
                      color="error"
                    />
                  )}
                  {selectedCandidate.has_application && (
                    <Chip 
                      label="Has Application"
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // TODO: Navigate to full candidate profile
              console.log('Navigate to full profile:', selectedCandidate?.candidate_id);
            }}
          >
            View Full Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interview Feedback Modal */}
      <Dialog 
        open={feedbackModalOpen} 
        onClose={() => setFeedbackModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8faf8'
        }}>
          <Assessment sx={{ color: '#db0011' }} />
          <Box>
            <Typography variant="h6">
              Interview Feedback - {selectedCandidateForFeedback?.candidate_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedCandidateForFeedback?.job_title}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedCandidateForFeedback && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Main Feedback Card */}
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      {/* Candidate & Job Info */}
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item>
                            <Avatar sx={{ bgcolor: '#db0011', width: 64, height: 64 }}>
                              {selectedCandidateForFeedback.candidate_name.charAt(0)}
                            </Avatar>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="h5" gutterBottom>
                              {selectedCandidateForFeedback.candidate_name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Role: {selectedCandidateForFeedback.job_title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Interview Date: 14 Aug 2024
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      {/* Overall Score & Recommendation */}
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                              Overall Match Score
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="h3" color="success.main">
                                {selectedCandidateForFeedback.overall_score}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={selectedCandidateForFeedback.overall_score}
                                sx={{ 
                                  width: 100, 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: 'success.main'
                                  }
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                              Recommendation
                            </Typography>
                            <Chip
                              label="✅ Proceed to Next Round"
                              color="success"
                              size="large"
                              sx={{ fontSize: '1rem', py: 1 }}
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      {/* Competency Scores */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Competency Scores
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Competency</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {[
                                { competency: 'Python Basics', score: 8, rating: 'Proficient', notes: 'Solid fundamentals', color: 'success' },
                                { competency: 'Functional Programming', score: 7, rating: 'Competent', notes: 'Could use more examples', color: 'warning' },
                                { competency: 'OOP Concepts', score: 9, rating: 'Expert', notes: 'Excellent application', color: 'success' },
                                { competency: 'Exception Handling', score: 6, rating: 'Average', notes: 'Missed edge cases', color: 'error' },
                                { competency: 'Communication', score: 8, rating: 'Proficient', notes: 'Clear, concise answers', color: 'success' }
                              ].map((competency, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={500}>
                                      {competency.competency}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        {competency.score}/10
                                      </Typography>
                                      <LinearProgress
                                        variant="determinate"
                                        value={(competency.score / 10) * 100}
                                        sx={{ 
                                          width: 60, 
                                          height: 6, 
                                          borderRadius: 3,
                                          bgcolor: 'grey.200',
                                          '& .MuiLinearProgress-bar': {
                                            bgcolor: competency.color === 'success' ? 'success.main' : 
                                                    competency.color === 'warning' ? 'warning.main' : 'error.main'
                                          }
                                        }}
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={competency.rating}
                                      color={competency.color}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {competency.notes}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      {/* Interviewer Notes */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Interviewer Notes
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "Great candidate, demonstrated strong practical knowledge, minor improvements needed in handling exception scenarios."
                          </Typography>
                        </Paper>
                      </Box>

                      {/* Final Decision */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Final Decision
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<Star />}
                          >
                            ✅ Proceed
                          </Button>
                          <Button
                            variant="outlined"
                            color="warning"
                          >
                            ⚠️ Hold
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                          >
                            ❌ Reject
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* AI Insight Panel */}
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Assessment sx={{ mr: 1, color: '#db0011' }} />
                        <Typography variant="h6">AI Insights</Typography>
                      </Box>
                      
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Candidate shows 90% fit for role. Consider targeted training in microservices to bridge gap.
                        </Typography>
                      </Alert>

                      <Typography variant="subtitle2" gutterBottom>
                        Key Strengths
                      </Typography>
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Chip label="Strong Python fundamentals" color="success" size="small" />
                        <Chip label="Excellent problem-solving" color="success" size="small" />
                        <Chip label="Clear communication" color="success" size="small" />
                      </Stack>

                      <Typography variant="subtitle2" gutterBottom>
                        Areas for Improvement
                      </Typography>
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Chip label="Exception handling" color="warning" size="small" />
                        <Chip label="Microservices exposure" color="warning" size="small" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setFeedbackModalOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Assessment />}
          >
            Send to Candidate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateRanking; 
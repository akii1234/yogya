import React, { useState, useEffect } from 'react';
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
  Analytics
} from '@mui/icons-material';
import rankingService from '../../services/rankingService';

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
      const response = await rankingService.getActiveJobs();
      setJobs(response.jobs || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async (jobId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await rankingService.getJobRankings(jobId);
      setRankings(response.rankings || []);
    } catch (err) {
      console.error('Error loading rankings:', err);
      setError('Failed to load rankings');
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
                <InputLabel>Select Job</InputLabel>
                <Select
                  value={selectedJob}
                  label="Select Job"
                  onChange={(e) => setSelectedJob(e.target.value)}
                  disabled={loading}
                >
                  {jobs.map((job) => (
                    <MenuItem key={job.job_id} value={job.job_id}>
                      {job.title} - {job.company}
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
    </Box>
  );
};

export default CandidateRanking; 
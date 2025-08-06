import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Pagination,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Work as WorkIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { fetchJobDescriptions, fetchAllJobDescriptions, fetchJobDescriptionsPaginated, deleteJobDescription } from '../../services/jobService';
import BulkJobUpload from './BulkJobUpload';

const JobList = ({ onEditJob, onCreateNew, refreshJobs }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [viewJobDialog, setViewJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bulkUploadDialog, setBulkUploadDialog] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });
  const [pageSize, setPageSize] = useState(100);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    loadJobs().then(() => {
      setIsInitialLoad(false);
    });
  }, []);

  // Reload jobs when pagination settings change (after initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      loadJobs(1);
    }
  }, [showAllJobs, pageSize, isInitialLoad]);

  const loadJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      if (showAllJobs) {
        // Load all jobs without pagination
        const data = await fetchAllJobDescriptions();
        setJobs(data);
        setPagination({
          count: data.length,
          next: null,
          previous: null,
          currentPage: 1
        });
      } else {
        // Load jobs with pagination
        const response = await fetchJobDescriptionsPaginated(page, pageSize);
        setJobs(response.results || response);
        setPagination({
          count: response.count || response.results?.length || 0,
          next: response.next,
          previous: response.previous,
          currentPage: page
        });
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load job descriptions');
    } finally {
      setLoading(false);
    }
  };

  // Expose loadJobs function to parent component
  useEffect(() => {
    if (refreshJobs) {
      refreshJobs.current = loadJobs;
    }
  }, [refreshJobs]);

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      draft: 'warning',
      closed: 'error'
    };
    return colors[status] || 'default';
  };

  const getExperienceLabel = (level) => {
    const levels = {
      entry: 'Entry Level',
      junior: 'Junior',
      mid: 'Mid Level',
      senior: 'Senior',
      lead: 'Lead',
      principal: 'Principal'
    };
    return levels[level] || level;
  };

  const getEmploymentTypeLabel = (type) => {
    const types = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
      freelance: 'Freelance'
    };
    return types[type] || type;
  };

  // Generate search suggestions from job titles
  const getSearchSuggestions = () => {
    if (!searchTerm.trim()) return [];
    
    const suggestions = jobs
      .filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(job => ({
        label: job.title,
        company: job.company,
        department: job.department
      }))
      .slice(0, 5); // Limit to 5 suggestions
    
    return suggestions;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesExperience = experienceFilter === 'all' || job.experience_level === experienceFilter;
    
    return matchesSearch && matchesStatus && matchesExperience;
  });

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job description?')) {
      try {
        await deleteJobDescription(jobId);
        setJobs(jobs.filter(job => job.id !== jobId));
      } catch (err) {
        setError('Failed to delete job description');
        console.error('Error deleting job:', err);
      }
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setViewJobDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewJobDialog(false);
    setSelectedJob(null);
  };

  const handlePageChange = (event, page) => {
    loadJobs(page);
  };

  const handleShowAllToggle = (checked) => {
    setShowAllJobs(checked);
    // Don't call loadJobs here as it will be called by useEffect
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    // Don't call loadJobs here as it will be called by useEffect
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <WorkIcon sx={{ mr: 1 }} />
          Jobs ({pagination.count})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
          >
            Create New Job
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setBulkUploadDialog(true)}
          >
            Create Bulk Jobs
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Autocomplete
              freeSolo
              options={getSearchSuggestions()}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.label;
              }}
              inputValue={searchTerm}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Jobs"
                  placeholder="Search..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ minWidth: 250, flex: 1 }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {option.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.company} • {option.department}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                label="Experience Level"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="principal">Principal</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Job List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Job Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Experience</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {jobs.length === 0 ? 'No job descriptions found. Create your first job!' : 'No jobs match your filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {job.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getEmploymentTypeLabel(job.employment_type)}
                    </Typography>
                  </TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${getExperienceLabel(job.experience_level)} (${job.min_experience_years}+ yrs)`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => onEditJob(job)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleViewJob(job)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteJob(job.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredJobs.length} of {pagination.count} job descriptions
          </Typography>
          
          {/* Show All Jobs Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={showAllJobs}
                onChange={(e) => handleShowAllToggle(e.target.checked)}
                size="small"
              />
            }
            label="Show All Jobs"
          />
          
          {/* Page Size Selector */}
          {!showAllJobs && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Page Size</InputLabel>
              <Select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                label="Page Size"
              >
                <MenuItem value={25}>25 per page</MenuItem>
                <MenuItem value={50}>50 per page</MenuItem>
                <MenuItem value={100}>100 per page</MenuItem>
                <MenuItem value={200}>200 per page</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        
        {/* Pagination */}
        {!showAllJobs && pagination.count > pageSize && (
          <Pagination
            count={Math.ceil(pagination.count / pageSize)}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        )}
      </Box>

      {/* View Job Dialog */}
      <Dialog
        open={viewJobDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Job Details</Typography>
            <IconButton onClick={handleCloseViewDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box sx={{ mt: 2 }}>
              {/* Job Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedJob.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={selectedJob.company} color="primary" variant="outlined" />
                  <Chip label={selectedJob.department} color="secondary" variant="outlined" />
                  <Chip label={selectedJob.location} color="info" variant="outlined" />
                  <Chip 
                    label={getEmploymentTypeLabel(selectedJob.employment_type)} 
                    color="success" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={selectedJob.status} 
                    color={getStatusColor(selectedJob.status)} 
                    size="small" 
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Job Details Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Experience Level
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {getExperienceLabel(selectedJob.experience_level)} ({selectedJob.min_experience_years}+ years)
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Posted Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedJob.posted_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Job Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedJob.description}
                </Typography>
              </Box>

              {/* Requirements */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedJob.requirements}
                </Typography>
              </Box>

              {/* Extracted Skills */}
              {selectedJob.extracted_skills && selectedJob.extracted_skills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Key Skills
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedJob.extracted_skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              onEditJob(selectedJob);
            }} 
            variant="contained" 
            color="primary"
          >
            Edit Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Job Upload Dialog */}
      <BulkJobUpload
        open={bulkUploadDialog}
        onClose={() => setBulkUploadDialog(false)}
        onSuccess={() => {
          setBulkUploadDialog(false);
          if (refreshJobs && refreshJobs.current) {
            refreshJobs.current();
          }
        }}
      />
    </Box>
  );
};

export default JobList; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Grid,
  Collapse,
  Icon
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { fetchCandidates } from '../../services/dashboardService';
import { fetchJobDescriptions } from '../../services/jobService';

const CandidateList = ({ onEditCandidate, onCreateNew }) => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState([]);
  const [educationFilter, setEducationFilter] = useState('all');
  const [selectedJobForMatch, setSelectedJobForMatch] = useState('all');
  const [matchDetailsOpen, setMatchDetailsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [selectedFilterCriteria, setSelectedFilterCriteria] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    loadCandidates();
    loadJobs();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading candidates...');
      const data = await fetchCandidates();
      console.log('Candidates data received:', data);
      
      // Transform the data to match frontend expectations
      const transformedData = data.map(candidate => ({
        id: candidate.id,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        email: candidate.email,
        phone: candidate.phone,
        current_position: candidate.current_title || 'Not specified',
        current_company: candidate.current_company || 'Not specified',
        experience_years: candidate.total_experience_years || 0,
        education_level: candidate.highest_education || 'Not specified',
        location: candidate.city && candidate.state ? `${candidate.city}, ${candidate.state}` : 'Not specified',
        status: candidate.status,
        extracted_skills: candidate.skills || []
      }));
      
      setCandidates(transformedData);
    } catch (err) {
      console.error('Error loading candidates:', err);
      setError('Failed to load candidates');
      // Fallback to mock data if API fails
      setCandidates([
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          current_position: 'Senior Software Engineer',
          current_company: 'Tech Corp',
          experience_years: 5,
          education_level: 'bachelor',
          location: 'New York, NY',
          status: 'active',
          extracted_skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB']
        },
        {
          id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0124',
          current_position: 'Frontend Developer',
          current_company: 'Startup Inc',
          experience_years: 3,
          education_level: 'bachelor',
          location: 'San Francisco, CA',
          status: 'active',
          extracted_skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git', 'TypeScript']
        }
      ]);
    } finally {
      setLoading(false);
      console.log('Loading finished. Candidates count:', candidates.length);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await fetchJobDescriptions();
      setJobs(data);
    } catch (err) {
      console.error('Error loading jobs:', err);
      // Fallback to empty array if API fails
      setJobs([]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'warning',
      hired: 'info',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  const getEducationLabel = (level) => {
    const levels = {
      high_school: 'High School',
      associate: 'Associate Degree',
      bachelor: "Bachelor's Degree",
      master: "Master's Degree",
      phd: 'PhD',
      self_taught: 'Self-Taught'
    };
    return levels[level] || level;
  };

  // Calculate match score between candidate and job
  const calculateMatchScore = (candidate, job) => {
    if (!job) return 0;

    let score = 0;
    let maxScore = 100;

    // Skills match (40 points)
    const candidateSkills = candidate.extracted_skills || [];
    const jobSkills = job.extracted_skills || [];
    const matchingSkills = candidateSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    const skillsScore = (matchingSkills.length / Math.max(jobSkills.length, 1)) * 40;
    score += skillsScore;

    // Experience match (30 points)
    const experienceDiff = Math.abs(candidate.experience_years - job.min_experience_years);
    const experienceScore = Math.max(0, 30 - (experienceDiff * 5));
    score += experienceScore;

    // Position relevance (20 points)
    const positionMatch = candidate.current_position.toLowerCase().includes(job.title.toLowerCase()) ||
                         job.title.toLowerCase().includes(candidate.current_position.toLowerCase());
    score += positionMatch ? 20 : 0;

    // Company/industry relevance (10 points)
    const companyMatch = candidate.current_company.toLowerCase().includes(job.company.toLowerCase()) ||
                        job.company.toLowerCase().includes(candidate.current_company.toLowerCase());
    score += companyMatch ? 10 : 0;

    return Math.round(score);
  };

  // Get match score for selected job or best match
  const getMatchScore = (candidate) => {
    if (selectedJobForMatch === 'all') {
      // Return best match score
      const scores = jobs.map(job => calculateMatchScore(candidate, job));
      return Math.max(...scores, 0);
    } else {
      const job = jobs.find(j => j.id === parseInt(selectedJobForMatch));
      return calculateMatchScore(candidate, job);
    }
  };

  // Get best matching jobs for a candidate
  const getBestMatchingJobs = (candidate) => {
    const jobScores = jobs.map(job => ({
      job,
      score: calculateMatchScore(candidate, job)
    }));
    
    // Sort by score descending and return top 3
    return jobScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(item => item.score > 0);
  };

  // Get match color based on score
  const getMatchColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'error';
  };

  // Generate search suggestions from candidate names and positions
  const getSearchSuggestions = () => {
    if (!searchTerm.trim()) return [];
    
    const suggestions = candidates
      .filter(candidate => 
        `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.current_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.current_company.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(candidate => ({
        label: `${candidate.first_name} ${candidate.last_name}`,
        position: candidate.current_position,
        company: candidate.current_company
      }))
      .slice(0, 5);
    
    return suggestions;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === '' || 
      candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.current_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.current_company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    
    const matchesExperience = experienceFilter === 'all' || 
      (experienceFilter === 'entry' && candidate.experience_years <= 2) ||
      (experienceFilter === 'mid' && candidate.experience_years >= 3 && candidate.experience_years <= 5) ||
      (experienceFilter === 'senior' && candidate.experience_years >= 5);

    const matchesLocation = locationFilter === '' || 
      candidate.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesSkills = skillsFilter.length === 0 || 
      skillsFilter.some(skill => 
        candidate.extracted_skills?.some(candidateSkill => 
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

    const matchesEducation = educationFilter === 'all' || 
      candidate.education_level === educationFilter;

    return matchesSearch && matchesStatus && matchesExperience && matchesLocation && matchesSkills && matchesEducation;
  });

  const handleApplyFilters = () => {
    setFiltersApplied(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setExperienceFilter('all');
    setLocationFilter('');
    setSkillsFilter([]);
    setEducationFilter('all');
    setSelectedJobForMatch('all');
    setFiltersApplied(false);
    setSelectedFilterCriteria([]);
    setActiveFilters([]);
  };

  const filterCriteriaOptions = [
    { value: 'location', label: 'Location', icon: '📍' },
    { value: 'skills', label: 'Skills', icon: '💻' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'status', label: 'Status', icon: '📊' },
    { value: 'experience', label: 'Experience', icon: '⏰' },
    { value: 'job_match', label: 'Job Match', icon: '🎯' }
  ];

  const handleAddFilter = (criteria) => {
    if (!selectedFilterCriteria.includes(criteria)) {
      setSelectedFilterCriteria([...selectedFilterCriteria, criteria]);
      setActiveFilters([...activeFilters, criteria]);
    }
  };

  const handleRemoveFilter = (criteria) => {
    setSelectedFilterCriteria(selectedFilterCriteria.filter(c => c !== criteria));
    setActiveFilters(activeFilters.filter(c => c !== criteria));
    
    // Reset the corresponding filter value
    switch (criteria) {
      case 'location':
        setLocationFilter('');
        break;
      case 'skills':
        setSkillsFilter([]);
        break;
      case 'education':
        setEducationFilter('all');
        break;
      case 'status':
        setStatusFilter('all');
        break;
      case 'experience':
        setExperienceFilter('all');
        break;
      case 'job_match':
        setSelectedJobForMatch('all');
        break;
      default:
        break;
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        // TODO: Replace with actual API call
        setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
      } catch (err) {
        setError('Failed to delete candidate');
        console.error('Error deleting candidate:', err);
      }
    }
  };

  const handleViewMatchDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setMatchDetailsOpen(true);
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} />
          Candidates ({candidates.length})
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Candidates are added when they apply for jobs
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search & Filters */}
      <Box sx={{ mb: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
        {/* Header with Toggle */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
          onClick={() => setIsSearchCollapsed(!isSearchCollapsed)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search & Filters
            </Typography>
            {activeFilters.length > 0 && (
              <Chip 
                label={`${activeFilters.length} active`} 
                size="small" 
                sx={{ ml: 2, backgroundColor: 'white', color: 'primary.main' }}
              />
            )}
          </Box>
          {isSearchCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </Box>

        {/* Collapsible Content */}
        <Collapse in={!isSearchCollapsed}>
          <Box sx={{ p: 3 }}>
            {/* Search Row */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 3 }}>
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
                    label="Search Candidates"
                    placeholder="Search by name, email, position, or company..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{ minWidth: 350, flex: 1 }}
                    size="medium"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.position} • {option.company}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Box>

            {/* Filter Criteria Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                Select Filter Criteria
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filterCriteriaOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={`${option.icon} ${option.label}`}
                    onClick={() => handleAddFilter(option.value)}
                    variant={selectedFilterCriteria.includes(option.value) ? "filled" : "outlined"}
                    color={selectedFilterCriteria.includes(option.value) ? "primary" : "default"}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Dynamic Filters */}
            {selectedFilterCriteria.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                  Active Filters
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {selectedFilterCriteria.includes('location') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="📍 Location" color="primary" size="small" />
                      <TextField
                        label="Location"
                        placeholder="e.g., New York, Remote"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: 200 }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFilter('location')}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {selectedFilterCriteria.includes('skills') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="💻 Skills" color="primary" size="small" />
                      <Autocomplete
                        multiple
                        options={['React', 'JavaScript', 'Python', 'Java', 'Node.js', 'Django', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'Git', 'TypeScript', 'Angular', 'Vue.js', 'PHP', 'C#', 'Ruby', 'Go', 'Kubernetes', 'Jenkins']}
                        value={skillsFilter}
                        onChange={(event, newValue) => setSkillsFilter(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select skills..."
                            size="small"
                            sx={{ minWidth: 250 }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFilter('skills')}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {selectedFilterCriteria.includes('education') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="🎓 Education" color="primary" size="small" />
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                          value={educationFilter}
                          onChange={(e) => setEducationFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Education</MenuItem>
                          <MenuItem value="high_school">High School</MenuItem>
                          <MenuItem value="bachelor">Bachelor's Degree</MenuItem>
                          <MenuItem value="master">Master's Degree</MenuItem>
                          <MenuItem value="phd">PhD</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFilter('education')}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {selectedFilterCriteria.includes('status') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="📊 Status" color="primary" size="small" />
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="hired">Hired</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFilter('status')}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {selectedFilterCriteria.includes('experience') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="⏰ Experience" color="primary" size="small" />
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          value={experienceFilter}
                          onChange={(e) => setExperienceFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Levels</MenuItem>
                          <MenuItem value="entry">Entry Level (0-2 years)</MenuItem>
                          <MenuItem value="mid">Mid Level (3-5 years)</MenuItem>
                          <MenuItem value="senior">Senior Level (5+ years)</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFilter('experience')}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {selectedFilterCriteria.includes('job_match') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="🎯 Job Match" color="primary" size="small" />
                      <FormControl size="small" sx={{ minWidth: 220 }}>
                        <Select
                          value={selectedJobForMatch}
                          onChange={(e) => setSelectedJobForMatch(e.target.value)}
                        >
                          <MenuItem value="all">Best Match (All Jobs)</MenuItem>
                          {jobs.map(job => (
                            <MenuItem key={job.id} value={job.id}>
                              {job.title} - {job.company}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFilter('job_match')}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                size="medium"
              >
                Clear All Filters
              </Button>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                size="medium"
                disabled={filtersApplied}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Candidate List */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
          Candidate List ({filteredCandidates.length} of {candidates.length})
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Candidate</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Current Position</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Experience</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Skills</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Match Score</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Matching Jobs</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {candidates.length === 0 ? 'No candidates found. Add your first candidate!' : 'No candidates match your filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => {
                const matchScore = getMatchScore(candidate);
                const bestMatchingJobs = getBestMatchingJobs(candidate);
                return (
                  <TableRow key={candidate.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {candidate.first_name} {candidate.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {candidate.current_company}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {candidate.email}
                        </Typography>
                        {candidate.phone && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {candidate.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {candidate.current_position}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getEducationLabel(candidate.education_level)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${candidate.experience_years} years`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {candidate.extracted_skills?.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {candidate.extracted_skills?.length > 3 && (
                          <Chip
                            label={`+${candidate.extracted_skills.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${matchScore}%`}
                          color={getMatchColor(matchScore)}
                          size="small"
                          icon={<TrendingUpIcon />}
                        />
                        <Tooltip title="View match details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewMatchDetails(candidate)}
                            color="primary"
                          >
                            <AssessmentIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {bestMatchingJobs.length > 0 ? (
                          bestMatchingJobs.map((match, index) => (
                            <Box key={match.job.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography 
                                variant="caption" 
                                color="primary" 
                                sx={{ 
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontWeight: 'bold',
                                  '&:hover': {
                                    color: 'primary.dark'
                                  }
                                }}
                                onClick={() => handleViewJobDetails(match.job)}
                              >
                                JD #{match.job.id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: '35px', textAlign: 'right' }}>
                                {match.score}%
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No matches
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={candidate.status}
                        color={getStatusColor(candidate.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => onEditCandidate(candidate)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => console.log('View candidate:', candidate.id)}
                          color="info"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </Typography>
      </Box>

      {/* Match Details Dialog */}
      <Dialog
        open={matchDetailsOpen}
        onClose={() => setMatchDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Match Analysis: {selectedCandidate && `${selectedCandidate.first_name} ${selectedCandidate.last_name}`}
        </DialogTitle>
        <DialogContent>
          {selectedCandidate && jobs.map(job => {
            const score = calculateMatchScore(selectedCandidate, job);
            const candidateSkills = selectedCandidate.extracted_skills || [];
            const jobSkills = job.extracted_skills || [];
            const matchingSkills = candidateSkills.filter(skill => 
              jobSkills.some(jobSkill => 
                jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(jobSkill.toLowerCase())
              )
            );
            
            return (
              <Box key={job.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {job.title} - {job.company}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Match Score</Typography>
                    <Typography variant="body2" fontWeight="bold" color={getMatchColor(score)}>
                      {score}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={score} 
                    color={getMatchColor(score)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Skills Match</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {matchingSkills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {matchingSkills.length} of {jobSkills.length} skills match
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Experience</Typography>
                    <Typography variant="body2">
                      Candidate: {selectedCandidate.experience_years} years
                    </Typography>
                    <Typography variant="body2">
                      Required: {job.min_experience_years}+ years
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog
        open={jobDetailsOpen}
        onClose={() => setJobDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Details: {selectedJob && `${selectedJob.title} at ${selectedJob.company}`}
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedJob.title} - {selectedJob.company}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Department: {selectedJob.department}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Experience Level: {selectedJob.experience_level}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Minimum Experience: {selectedJob.min_experience_years}+ years
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Skills Required:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {selectedJob.extracted_skills?.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateList; 
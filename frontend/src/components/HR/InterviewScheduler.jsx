import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Paper,
  Badge,
  Switch,
  FormControlLabel,
  Autocomplete,
  AlertTitle
} from '@mui/material';
import {
  Schedule,
  Person,
  Work,
  AccessTime,
  CheckCircle,
  Warning,
  Error,
  Add,
  Edit,
  Delete,
  VideoCall,
  SmartToy,
  Psychology,
  Assessment,
  Timer,
  CalendarToday,
  LocationOn,
  Send,
  Refresh,
  Search,
  PlayArrow
} from '@mui/icons-material';
import interviewSchedulerService from '../../services/interviewSchedulerService';
import LiveInterviewInterface from '../Interviewer/LiveInterviewInterface';
const mockCandidates = [
  {
    id: '1',
    name: 'Akhil Tripathi',
    email: 'akhiltripathi.t1@gmail.com',
    avatar: 'AT',
    phone: '+1-555-0123',
    currentRole: 'Software Engineer',
    experience: '3 years',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    applications: [
      {
        jobId: 'JOB-001',
        jobTitle: 'Senior Full Stack Developer',
        company: 'TechCorp Solutions',
        appliedDate: '2024-12-01',
        status: 'shortlisted'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: 'SJ',
    phone: '+1-555-0124',
    currentRole: 'Data Scientist',
    experience: '5 years',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    applications: [
      {
        jobId: 'JOB-002',
        jobTitle: 'Senior Data Scientist',
        company: 'InnovateTech',
        appliedDate: '2024-12-02',
        status: 'under_review'
      }
    ]
  }
];

const mockInterviewers = [
  {
    id: '1',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    avatar: 'ED',
    role: 'Senior HR Manager',
    specialties: ['Technical Interviews', 'Behavioral Interviews'],
    availability: ['Monday', 'Wednesday', 'Friday']
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    avatar: 'MC',
    role: 'Engineering Manager',
    specialties: ['Technical Interviews', 'System Design'],
    availability: ['Tuesday', 'Thursday']
  },
  {
    id: '3',
    name: 'Lisa Wang',
    email: 'lisa.wang@company.com',
    avatar: 'LW',
    role: 'Data Science Lead',
    specialties: ['Data Science Interviews', 'ML Interviews'],
    availability: ['Monday', 'Tuesday', 'Thursday', 'Friday']
  }
];

const mockJobs = [
  {
    id: 'JOB-001',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time'
  },
  {
    id: 'JOB-002',
    title: 'Senior Data Scientist',
    company: 'InnovateTech',
    department: 'Data Science',
    location: 'New York, NY',
    type: 'Full-time'
  }
];

const InterviewScheduler = () => {
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [interviewDateTime, setInterviewDateTime] = useState(new Date());
  const [interviewDuration, setInterviewDuration] = useState(60);
  const [interviewType, setInterviewType] = useState('technical');
  const [interviewMode, setInterviewMode] = useState('video_call');
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [aiMode, setAiMode] = useState('ai_assisted');
  const [meetingLink, setMeetingLink] = useState('');
  const [instructions, setInstructions] = useState('');
  const [competencies, setCompetencies] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Live interview states
  const [showLiveInterview, setShowLiveInterview] = useState(false);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading interview scheduler data...');
      
      // Load all data in parallel
      const [candidatesData, interviewersData, jobsData, scheduledData] = await Promise.all([
        interviewSchedulerService.getCandidatesForScheduling().catch(err => {
          console.warn('Failed to load candidates:', err);
          return { candidates: mockCandidates };
        }),
        interviewSchedulerService.getInterviewers().catch(err => {
          console.warn('Failed to load interviewers:', err);
          return { interviewers: mockInterviewers };
        }),
        interviewSchedulerService.getJobsForScheduling().catch(err => {
          console.warn('Failed to load jobs:', err);
          return { jobs: mockJobs };
        }),
        interviewSchedulerService.getScheduledInterviews().catch(err => {
          console.warn('Failed to load scheduled interviews:', err);
          return { interviews: [] };
        })
      ]);
      
      const candidatesList = candidatesData.candidates || mockCandidates;
      const jobsList = jobsData.jobs || mockJobs;
      
      setCandidates(candidatesList);
      setInterviewers(interviewersData.interviewers || mockInterviewers);
      setJobs(jobsList);
      setFilteredJobs(jobsList); // Initialize filtered jobs with all jobs
      
      // Ensure scheduledInterviews is always an array
      const interviews = scheduledData.interviews || scheduledData || [];
      console.log('📊 Scheduled interviews data:', scheduledData);
      console.log('📊 Final interviews array:', interviews);
      setScheduledInterviews(Array.isArray(interviews) ? interviews : []);
      
      console.log('✅ Interview scheduler data loaded');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedCandidate || !selectedJob || !selectedInterviewer) {
      setError('Please select candidate, job, and interviewer');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Selected candidate:', selectedCandidate);
      console.log('Selected job:', selectedJob);
      console.log('Selected interviewer:', selectedInterviewer);
      
      const interviewData = {
        candidate_id: selectedCandidate.id,
        job_id: selectedJob.job_id || selectedJob.id,
        interviewer_id: selectedInterviewer.id,
        scheduled_date: interviewDateTime.toISOString(),
        duration: interviewDuration,
        interview_type: interviewType,
        mode: interviewMode,
        ai_enabled: isAIEnabled,
        ai_mode: aiMode,
        meeting_link: meetingLink || null, // Optional - use built-in video calling if not provided
        instructions: instructions || 'Standard interview instructions will be sent separately.',
        competencies: competencies.length > 0 ? competencies : ['Problem Solving', 'Technical Skills', 'Communication']
      };
      
      console.log('Interview data being sent:', interviewData);

      const response = await interviewSchedulerService.scheduleInterview(interviewData);
      
      if (response.success) {
        // Add the new interview to the list
        setScheduledInterviews(prev => [...prev, response.interview]);
        setScheduleDialogOpen(false);
        resetForm();
        
        console.log('✅ Interview scheduled:', response.interview);
      } else {
        setError(response.error || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('❌ Error scheduling interview:', error);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on selected candidate's applications
  const filterJobsForCandidate = (candidate) => {
    if (!candidate) {
      setFilteredJobs(jobs); // Show all jobs if no candidate selected
      return;
    }
    
    if (!candidate.applied_jobs || candidate.applied_jobs.length === 0) {
      console.log(`Candidate ${candidate.first_name || candidate.name || 'Unknown'} has no applied jobs, showing all jobs`);
      setFilteredJobs(jobs); // Show all jobs if candidate has no applications
      return;
    }
    
    // Filter jobs to only show those the candidate has applied for
    const appliedJobIds = candidate.applied_jobs.map(job => job.job_id || job.id);
    const filtered = jobs.filter(job => appliedJobIds.includes(job.job_id || job.id));
    setFilteredJobs(filtered);
    
    console.log(`Candidate ${candidate.name} applied jobs:`, candidate.applied_jobs);
    console.log(`Applied job IDs:`, appliedJobIds);
    console.log(`Filtered jobs for candidate ${candidate.name}:`, filtered);
  };

  // Handle candidate selection
  const handleCandidateSelection = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedJob(null); // Reset job selection when candidate changes
    filterJobsForCandidate(candidate);
  };

  const resetForm = () => {
    setSelectedCandidate(null);
    setSelectedJob(null);
    setSelectedInterviewer(null);
    setFilteredJobs(jobs); // Reset to show all jobs
    setInterviewDateTime(new Date());
    setInterviewDuration(60);
    setInterviewType('technical');
    setInterviewMode('video_call');
    setIsAIEnabled(true);
    setAiMode('ai_assisted');
    setMeetingLink('');
    setInstructions('');
    setCompetencies([]);
    setError(null);
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      const response = await interviewSchedulerService.cancelInterview(interviewId);
      
      if (response.success) {
        setScheduledInterviews(prev => prev.filter(i => i.id !== interviewId));
        console.log('🗑️ Interview deleted:', interviewId);
      } else {
        setError(response.error || 'Failed to delete interview');
      }
    } catch (error) {
      console.error('❌ Error deleting interview:', error);
      setError('Failed to delete interview. Please try again.');
    }
  };

  const handleStartLiveInterview = (interviewId) => {
    setCurrentInterviewId(interviewId);
    setShowLiveInterview(true);
  };

  const handleCompleteLiveInterview = (interviewData) => {
    console.log('✅ Interview completed:', interviewData);
    setShowLiveInterview(false);
    setCurrentInterviewId(null);
    
    // Refresh the interviews list
    loadData();
  };

  const handleCloseLiveInterview = () => {
    setShowLiveInterview(false);
    setCurrentInterviewId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'rescheduled': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Schedule />;
      case 'in_progress': return <AccessTime />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Error />;
      case 'rescheduled': return <Warning />;
      default: return <Schedule />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'technical': return 'Technical Interview';
      case 'behavioral': return 'Behavioral Interview';
      case 'mixed': return 'Mixed Interview';
      case 'final': return 'Final Round';
      default: return 'Interview';
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'video_call': return 'Video Call';
      case 'phone_call': return 'Phone Call';
      case 'in_person': return 'In Person';
      case 'ai_only': return 'AI Interview';
      default: return 'Interview';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInterviews = (Array.isArray(scheduledInterviews) ? scheduledInterviews : []).filter(interview => {
    const matchesSearch = interview.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Interview Scheduler
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule and manage interviews with candidates
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Interviews
                </Typography>
                <Typography variant="h4" component="div">
                  {scheduledInterviews.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Scheduled Today
                </Typography>
                <Typography variant="h4" component="div">
                  {scheduledInterviews.filter(i => {
                    const today = new Date().toDateString();
                    return new Date(i.scheduledDate).toDateString() === today;
                  }).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  This Week
                </Typography>
                <Typography variant="h4" component="div">
                  {scheduledInterviews.filter(i => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(i.scheduledDate) >= weekAgo;
                  }).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  AI-Enabled
                </Typography>
                <Typography variant="h4" component="div">
                  {scheduledInterviews.filter(i => i.isAIEnabled).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1, mr: 2 }}>
            <TextField
              placeholder="Search interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            Schedule Interview
          </Button>
        </Box>

        {/* Interviews List */}
        <Grid container spacing={3}>
          {filteredInterviews.map((interview) => (
            <Grid xs={12} md={6} lg={4} key={interview.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#db0011', mr: 2 }}>
                      {interview.candidate.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {interview.candidate.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {interview.candidate.email}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(interview.status)}
                      label={interview.status.replace('_', ' ')}
                      color={getStatusColor(interview.status)}
                      size="small"
                    />
                  </Box>

                  {/* Job Info */}
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {interview.job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {interview.job.company}
                  </Typography>

                  {/* Interview Details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(interview.scheduledDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {interview.duration} min • {getTypeLabel(interview.type)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {interview.interviewer.name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* AI Mode */}
                  {interview.isAIEnabled && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<SmartToy />}
                        label={`AI ${interview.aiMode === 'ai_assisted' ? 'Assisted' : 'Co-Pilot'}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {/* Spacer */}
                  <Box sx={{ flexGrow: 1 }} />

                  {/* Actions */}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      fullWidth
                      color="success"
                      onClick={() => handleStartLiveInterview(interview.id)}
                      disabled={interview.status === 'completed'}
                    >
                      {interview.status === 'completed' ? 'Completed' : 'Start Interview'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Delete />}
                      color="error"
                      onClick={() => handleDeleteInterview(interview.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Schedule Interview Dialog */}
        <Dialog 
          open={scheduleDialogOpen} 
          onClose={() => setScheduleDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              minHeight: '80vh',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f8faf8',
            py: 3
          }}>
            <Schedule sx={{ color: '#db0011', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                Schedule New Interview
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* Candidate Selection */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Candidate
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedCandidate?.id || ''}
                    onChange={(e) => {
                      const candidate = candidates.find(c => c.id === e.target.value);
                      handleCandidateSelection(candidate);
                    }}
                    displayEmpty
                    sx={{
                      minHeight: '64px',
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
                        fontSize: '1.1rem',
                        fontWeight: selectedCandidate ? 600 : 500,
                        color: selectedCandidate ? '#2e7d32' : '#666666',
                        padding: '16px 14px',
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
                        <Avatar sx={{ mr: 3, bgcolor: '#db0011', width: 48, height: 48, fontSize: '1.2rem', fontWeight: 600 }}>
                          ?
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#666666' }}>
                            Select Candidate
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                            Choose a candidate for the interview
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    {candidates.map((candidate) => (
                      <MenuItem key={candidate.id} value={candidate.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Avatar sx={{ mr: 3, bgcolor: '#db0011', width: 48, height: 48, fontSize: '1.2rem', fontWeight: 600 }}>
                            {candidate.avatar}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2e7d32', mb: 0.5 }}>
                              {candidate.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                              {candidate.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Job Selection */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Job Position
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedJob?.job_id || selectedJob?.id || ''}
                    onChange={(e) => {
                      const job = filteredJobs.find(j => (j.job_id || j.id) === e.target.value);
                      setSelectedJob(job);
                    }}
                    displayEmpty
                    sx={{
                      minHeight: '64px',
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
                        fontSize: '1.1rem',
                        fontWeight: selectedJob ? 600 : 500,
                        color: selectedJob ? '#2e7d32' : '#666666',
                        padding: '16px 14px',
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
                        <Work sx={{ mr: 3, color: '#db0011', fontSize: 28 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#666666' }}>
                            {selectedCandidate && filteredJobs.length === 0 ? 'No Applied Jobs' : 'Select Job'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                            {selectedCandidate && filteredJobs.length === 0 
                              ? `${selectedCandidate.name} has not applied to any jobs yet`
                              : 'Choose a job position for the interview'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    {filteredJobs.map((job) => (
                      <MenuItem key={job.job_id || job.id} value={job.job_id || job.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Work sx={{ mr: 3, color: '#db0011', fontSize: 28 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2e7d32', mb: 0.5 }}>
                              {job.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                              {job.company}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Interviewer Selection */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Interviewer
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedInterviewer?.id || ''}
                    onChange={(e) => {
                      const interviewer = interviewers.find(i => i.id === e.target.value);
                      setSelectedInterviewer(interviewer);
                    }}
                    displayEmpty
                    sx={{
                      minHeight: '64px',
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
                        fontSize: '1.1rem',
                        fontWeight: selectedInterviewer ? 600 : 500,
                        color: selectedInterviewer ? '#2e7d32' : '#666666',
                        padding: '16px 14px',
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
                        <Avatar sx={{ mr: 3, bgcolor: '#db0011', width: 48, height: 48, fontSize: '1.2rem', fontWeight: 600 }}>
                          ?
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', color: '#666666' }}>
                            Select Interviewer
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                            Choose an interviewer for the interview
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    {interviewers.map((interviewer) => (
                      <MenuItem key={interviewer.id} value={interviewer.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Avatar sx={{ mr: 3, bgcolor: '#db0011', width: 48, height: 48, fontSize: '1.2rem', fontWeight: 600 }}>
                            {interviewer.avatar}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2e7d32', mb: 0.5 }}>
                              {interviewer.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                              {interviewer.role}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* AI Assistant Settings */}
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  AI Assistant Settings
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isAIEnabled}
                        onChange={(e) => setIsAIEnabled(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#db0011',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#db0011',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem' }}>
                        Enable AI Assistant
                      </Typography>
                    }
                  />
                  {isAIEnabled && (
                    <FormControl sx={{ minWidth: 250 }}>
                      <Select
                        value={aiMode}
                        onChange={(e) => setAiMode(e.target.value)}
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
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              '& .MuiMenuItem-root': {
                                minHeight: '48px',
                                fontSize: '1rem',
                                padding: '12px 16px',
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="ai_assisted">AI Assisted</MenuItem>
                        <MenuItem value="ai_co_pilot">AI Co-Pilot</MenuItem>
                        <MenuItem value="ai_lead">AI Lead</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Grid>

              {/* Date & Time */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Date & Time
                </Typography>
                <TextField
                  type="datetime-local"
                  value={interviewDateTime.toISOString().slice(0, 16)}
                  onChange={(e) => setInterviewDateTime(new Date(e.target.value))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: '64px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#db0011',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#db0011',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: '#2e7d32',
                        padding: '16px 14px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#2e7d32',
                    },
                    '& .MuiInputLabel-shrink': {
                      fontSize: '1rem',
                      color: '#db0011',
                    },
                  }}
                />
              </Grid>

              {/* Duration */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Duration
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={interviewDuration}
                    onChange={(e) => setInterviewDuration(e.target.value)}
                    sx={{
                      minHeight: '64px',
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
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: '#2e7d32',
                        padding: '16px 14px',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            minHeight: '56px',
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
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={90}>1.5 hours</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Interview Type */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Interview Type
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    sx={{
                      minHeight: '64px',
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
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: '#2e7d32',
                        padding: '16px 14px',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            minHeight: '56px',
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
                    <MenuItem value="technical">Technical Interview</MenuItem>
                    <MenuItem value="behavioral">Behavioral Interview</MenuItem>
                    <MenuItem value="mixed">Mixed Interview</MenuItem>
                    <MenuItem value="final">Final Round</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Interview Mode */}
              <Grid xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Interview Mode
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    sx={{
                      minHeight: '64px',
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
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: '#2e7d32',
                        padding: '16px 14px',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            minHeight: '56px',
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
                    <MenuItem value="video_call">Video Call</MenuItem>
                    <MenuItem value="phone_call">Phone Call</MenuItem>
                    <MenuItem value="in_person">In Person</MenuItem>
                    <MenuItem value="ai_only">AI Interview</MenuItem>
                  </Select>
                </FormControl>

              </Grid>        
              {/* Meeting Link */}
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Meeting Link (Optional)
                </Typography>
                <TextField
                  fullWidth
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  helperText="Leave empty to use built-in video calling. External links are optional."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: '64px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#db0011',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#db0011',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: '#2e7d32',
                        padding: '16px 14px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#2e7d32',
                    },
                    '& .MuiInputLabel-shrink': {
                      fontSize: '1rem',
                      color: '#db0011',
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </Grid>

              {/* Instructions */}
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Interview Instructions
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter specific instructions for this interview..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#db0011',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#db0011',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#2e7d32',
                    },
                    '& .MuiInputLabel-shrink': {
                      fontSize: '1rem',
                      color: '#db0011',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      fontWeight: 500,
                      color: '#2e7d32',
                      padding: '16px 14px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', gap: 2 }}>
            <Button 
              onClick={() => setScheduleDialogOpen(false)}
              sx={{ 
                px: 3, 
                py: 1.5, 
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleScheduleInterview}
              disabled={!selectedCandidate || !selectedJob || !selectedInterviewer}
              sx={{ 
                px: 3, 
                py: 1.5, 
                fontSize: '1rem',
                fontWeight: 500,
                bgcolor: '#db0011',
                '&:hover': {
                  bgcolor: '#a7000e',
                },
                '&:disabled': {
                  bgcolor: '#cccccc',
                  color: '#666666',
                }
              }}
            >
              Schedule Interview
            </Button>
          </DialogActions>
        </Dialog>

      {/* Live Interview Interface */}
      {showLiveInterview && currentInterviewId && (
        <LiveInterviewInterface
          interviewId={currentInterviewId}
          onComplete={handleCompleteLiveInterview}
          onClose={handleCloseLiveInterview}
        />
      )}
    </Box>
  );
};

// Interview Scheduler Component
export default InterviewScheduler;

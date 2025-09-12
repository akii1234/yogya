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
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
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
        company: 'BigTech',
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
            company: 'BigTech',
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

const mockScheduledInterviews = [
  {
    id: '1',
    candidate: {
      id: '1',
      name: 'Alex Rodriguez',
      email: 'alex.python@demo.com',
      avatar: 'AR',
      experience: 8,
      assessmentCleared: true,
      matchScore: 95
    },
    job: {
      id: 'JOB-001',
      title: 'Python Developer',
      company: 'BigTech',
      location: 'Bangalore, India'
    },
    interviewer: {
      id: '1',
      name: 'Emily Davis',
      email: 'emily.davis@company.com'
    },
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    duration: 60,
    type: 'technical',
    status: 'scheduled',
    isAIEnabled: true,
    aiMode: 'ai_assisted',
    meetingLink: 'https://meet.bigtech.com/interview-001'
  },
  {
    id: '2',
    candidate: {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.senior@demo.com',
      avatar: 'MC',
      experience: 10,
      assessmentCleared: true,
      matchScore: 92
    },
    job: {
      id: 'JOB-001',
      title: 'Python Developer',
      company: 'BigTech',
      location: 'Bangalore, India'
    },
    interviewer: {
      id: '2',
      name: 'John Smith',
      email: 'john.smith@company.com'
    },
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    duration: 45,
    type: 'behavioral',
    status: 'scheduled',
    isAIEnabled: true,
    aiMode: 'ai_co_pilot',
    meetingLink: 'https://meet.bigtech.com/interview-002'
  },
  {
    id: '3',
    candidate: {
      id: '3',
      name: 'Sarah Johnson',
      email: 'sarah.dev@demo.com',
      avatar: 'SJ',
      experience: 6,
      assessmentCleared: true,
      matchScore: 88
    },
    job: {
      id: 'JOB-002',
      title: 'Full Stack Developer',
      company: 'BigTech',
      location: 'Hyderabad, India'
    },
    interviewer: {
      id: '1',
      name: 'Emily Davis',
      email: 'emily.davis@company.com'
    },
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 60,
    type: 'technical',
    status: 'scheduled',
    isAIEnabled: false,
    aiMode: 'ai_assisted',
    meetingLink: 'https://meet.bigtech.com/interview-003'
  },
  {
    id: '4',
    candidate: {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma.frontend@demo.com',
      avatar: 'EW',
      experience: 5,
      assessmentCleared: false,
      matchScore: 72
    },
    job: {
      id: 'JOB-003',
      title: 'Frontend Developer',
      company: 'BigTech',
      location: 'Pune, India'
    },
    interviewer: {
      id: '2',
      name: 'John Smith',
      email: 'john.smith@company.com'
    },
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    duration: 45,
    type: 'technical',
    status: 'scheduled',
    isAIEnabled: true,
    aiMode: 'ai_assisted',
    meetingLink: 'https://meet.bigtech.com/interview-004'
  },
  {
    id: '5',
    candidate: {
      id: '5',
      name: 'John Smith',
      email: 'john.fullstack@demo.com',
      avatar: 'JS',
      experience: 6,
      assessmentCleared: true,
      matchScore: 85
    },
    job: {
      id: 'JOB-002',
      title: 'Full Stack Developer',
      company: 'BigTech',
      location: 'Hyderabad, India'
    },
    interviewer: {
      id: '1',
      name: 'Emily Davis',
      email: 'emily.davis@company.com'
    },
    scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday (completed)
    duration: 60,
    type: 'technical',
    status: 'completed',
    isAIEnabled: true,
    aiMode: 'ai_co_pilot',
    meetingLink: 'https://meet.bigtech.com/interview-005'
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
  
  // Results modal states
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [selectedInterviewResults, setSelectedInterviewResults] = useState(null);

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
          return { interviews: mockScheduledInterviews };
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
      
      // Use mock data if no interviews are returned
      const finalInterviews = Array.isArray(interviews) && interviews.length > 0 ? interviews : mockScheduledInterviews;
      setScheduledInterviews(finalInterviews);
      
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

  const handleViewResults = (interviewId) => {
    // Find the interview data
    const interview = scheduledInterviews.find(i => i.id === interviewId);
    if (interview) {
      // Mock detailed results data - in real app, this would come from API
      const mockResults = {
        interview: interview,
        overallScore: 82.70,
        competencyEvaluations: [
          {
            competency: "Python Programming",
            score: 85,
            level: "proficient",
            feedback: "Strong understanding of Python syntax, data structures, and OOP concepts. Demonstrated good problem-solving skills with clean, readable code.",
            strengths: "Excellent grasp of Python fundamentals, good use of list comprehensions, and proper error handling.",
            areasForImprovement: "Could benefit from more advanced Python features like decorators and context managers."
          },
          {
            competency: "Django Framework",
            score: 78,
            level: "competent",
            feedback: "Good knowledge of Django models, views, and templates. Some gaps in advanced features like middleware and signals.",
            strengths: "Solid understanding of Django ORM, URL routing, and template system.",
            areasForImprovement: "Needs more experience with Django REST framework and advanced Django features."
          },
          {
            competency: "Database Design",
            score: 82,
            level: "proficient",
            feedback: "Solid understanding of relational databases, SQL queries, and database optimization techniques.",
            strengths: "Good knowledge of database normalization, indexing, and query optimization.",
            areasForImprovement: "Could improve knowledge of NoSQL databases and advanced database concepts."
          },
          {
            competency: "API Development",
            score: 90,
            level: "expert",
            feedback: "Excellent knowledge of REST APIs, authentication, and API design patterns. Very strong in this area.",
            strengths: "Outstanding API design skills, proper HTTP status codes, and comprehensive error handling.",
            areasForImprovement: "Consider learning GraphQL for more complex API requirements."
          },
          {
            competency: "Testing",
            score: 75,
            level: "competent",
            feedback: "Basic understanding of unit testing and test-driven development. Needs improvement in integration testing.",
            strengths: "Good knowledge of pytest and basic unit testing concepts.",
            areasForImprovement: "Needs more experience with integration testing, mocking, and test coverage analysis."
          },
          {
            competency: "Problem Solving",
            score: 88,
            level: "proficient",
            feedback: "Strong analytical thinking and problem-solving approach. Able to break down complex problems into manageable parts.",
            strengths: "Excellent logical reasoning, good use of algorithms and data structures.",
            areasForImprovement: "Could improve in system design and scalability considerations."
          }
        ],
        interviewNotes: "Candidate demonstrated strong technical skills and good communication. Showed enthusiasm for the role and asked thoughtful questions about the team and projects. Recommended for next round.",
        recommendations: "Strong candidate with excellent potential. Consider for next round of interviews.",
        interviewer: {
          name: "Dr. Sarah Wilson",
          email: "sarah.wilson@bigtech.com",
          title: "Senior Engineering Manager"
        },
        aiAnalysis: {
          overallConfidence: 0.87,
          aiAssisted: true,
          aiMode: "ai_assisted",
          confidenceBreakdown: {
            technicalSkills: 0.92,
            communicationSkills: 0.78,
            problemSolving: 0.89,
            culturalFit: 0.85,
            overallPotential: 0.88
          },
          aiInsights: [
            "AI detected strong pattern recognition in Python problem-solving approaches",
            "Natural language processing analysis shows excellent technical communication clarity",
            "Behavioral analysis indicates high adaptability and learning potential",
            "Code quality assessment reveals consistent best practices implementation"
          ],
          aiRecommendations: [
            "Candidate shows exceptional potential for senior-level technical challenges",
            "AI suggests focusing on system design questions in next round",
            "Recommended for technical leadership track based on communication patterns",
            "High confidence in candidate's ability to mentor junior developers"
          ],
          aiFlags: [
            {
              type: "positive",
              message: "AI detected advanced debugging techniques and systematic approach"
            },
            {
              type: "positive", 
              message: "Strong consistency in code quality across different problem domains"
            },
            {
              type: "neutral",
              message: "AI suggests additional testing methodology questions for comprehensive evaluation"
            }
          ],
          aiMetrics: {
            responseTime: "2.3s avg",
            codeQuality: "A+",
            technicalDepth: "High",
            communicationClarity: "Excellent",
            problemSolvingApproach: "Systematic"
          }
        }
      };
      
      setSelectedInterviewResults(mockResults);
      setResultsModalOpen(true);
    }
  };

  const handleCloseResultsModal = () => {
    setResultsModalOpen(false);
    setSelectedInterviewResults(null);
  };

  const handleDownloadResults = () => {
    if (selectedInterviewResults) {
      // Create a downloadable report
      const reportData = {
        candidate: selectedInterviewResults.interview.candidate,
        job: selectedInterviewResults.interview.job,
        overallScore: selectedInterviewResults.overallScore,
        competencyEvaluations: selectedInterviewResults.competencyEvaluations,
        interviewNotes: selectedInterviewResults.interviewNotes,
        recommendations: selectedInterviewResults.recommendations,
        interviewer: selectedInterviewResults.interviewer,
        aiAnalysis: selectedInterviewResults.aiAnalysis,
        generatedAt: new Date().toISOString(),
        reportType: "AI-Enhanced Interview Results"
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-results-${selectedInterviewResults.interview.candidate.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSendToHM = () => {
    // In real app, this would send email to hiring manager
    alert('Interview results sent to Hiring Manager successfully!');
  };

  const handleSendToCandidate = () => {
    // In real app, this would send email to candidate
    alert('Interview results sent to candidate successfully!');
  };

  const handleProceedToNextRound = () => {
    if (selectedInterviewResults) {
      // In real app, this would update the candidate status and send notifications
      const candidateName = selectedInterviewResults.interview.candidate.name;
      const jobTitle = selectedInterviewResults.interview.job.title;
      
      alert(`✅ ${candidateName} has been advanced to the next round for ${jobTitle}!\n\nNext steps:\n• Candidate will be notified via email\n• Hiring manager will be informed\n• Next round interview will be scheduled`);
      
      // Close the modal after action
      handleCloseResultsModal();
    }
  };

  const handleRejectCandidate = () => {
    if (selectedInterviewResults) {
      // In real app, this would update the candidate status and send notifications
      const candidateName = selectedInterviewResults.interview.candidate.name;
      const jobTitle = selectedInterviewResults.interview.job.title;
      
      const confirmed = window.confirm(
        `⚠️ Are you sure you want to reject ${candidateName} for ${jobTitle}?\n\nThis action will:\n• Update candidate status to "Rejected"\n• Send rejection email to candidate\n• Remove from active consideration\n\nThis action cannot be undone.`
      );
      
      if (confirmed) {
        alert(`❌ ${candidateName} has been rejected for ${jobTitle}.\n\nActions completed:\n• Candidate status updated\n• Rejection email sent\n• Removed from active pipeline`);
        
        // Close the modal after action
        handleCloseResultsModal();
      }
    }
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

        {/* Interviews Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Candidate</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Job Position</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Interviewer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Type & Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>AI Mode</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInterviews.map((interview, index) => (
                  <TableRow 
                    key={interview.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f0f8f0',
                        transition: 'background-color 0.2s ease'
                      },
                      backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                      borderBottom: '1px solid #e8f5e8',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Candidate */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {/* AI Assessment Indicator */}
                        {interview.candidate.assessmentCleared && (
                          <Tooltip title="Cleared AI Preliminary Assessment" arrow>
                            <Box sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              left: -8, 
                              zIndex: 1,
                              backgroundColor: '#1976d2',
                              borderRadius: '50%',
                              width: 20,
                              height: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              cursor: 'help'
                            }}>
                              <Typography sx={{ 
                                color: 'white', 
                                fontSize: '10px', 
                                fontWeight: 'bold',
                                lineHeight: 1
                              }}>
                                AI
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
                        
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
                          {interview.candidate.avatar || interview.candidate.name?.charAt(0) || 'C'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {interview.candidate.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {interview.candidate.email}
                          </Typography>
                          {interview.candidate.experience && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              {interview.candidate.experience} years exp
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Job Position */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {interview.job.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {interview.job.company}
                        </Typography>
                        {interview.job.location && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            📍 {interview.job.location}
                          </Typography>
                        )}
                        {interview.candidate.matchScore && (
                          <Chip
                            label={`${interview.candidate.matchScore}% Match`}
                            size="small"
                            color={interview.candidate.matchScore >= 80 ? 'success' : interview.candidate.matchScore >= 60 ? 'warning' : 'error'}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Interviewer */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'secondary.main', width: 32, height: 32 }}>
                          {interview.interviewer.name?.charAt(0) || 'I'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {interview.interviewer.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {interview.interviewer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(interview.scheduledDate)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Type & Duration */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {getTypeLabel(interview.type)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {interview.duration} minutes
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(interview.status)}
                        label={interview.status.replace('_', ' ')}
                        color={getStatusColor(interview.status)}
                        size="small"
                      />
                    </TableCell>

                    {/* AI Mode */}
                    <TableCell>
                      {interview.isAIEnabled ? (
                        <Chip
                          icon={<SmartToy />}
                          label={`AI ${interview.aiMode === 'ai_assisted' ? 'Assisted' : 'Co-Pilot'}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          Traditional
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {interview.status === 'completed' ? (
                          <Tooltip title="View Interview Results">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewResults(interview.id)}
                            >
                              <Assessment />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Start Interview">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStartLiveInterview(interview.id)}
                              disabled={interview.status === 'completed'}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete Interview">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteInterview(interview.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Summary */}
        {!loading && filteredInterviews.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Showing {filteredInterviews.length} of {scheduledInterviews.length} scheduled interviews
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Scheduled: {scheduledInterviews.filter(i => i.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed: {scheduledInterviews.filter(i => i.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                AI-Enabled: {scheduledInterviews.filter(i => i.isAIEnabled).length}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {!loading && filteredInterviews.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No interviews found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No interviews have been scheduled yet'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule First Interview
            </Button>
          </Box>
        )}

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

      {/* Interview Results Modal */}
      <Dialog 
        open={resultsModalOpen} 
        onClose={handleCloseResultsModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5', 
          borderBottom: '2px solid #1976d2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Interview Results
            </Typography>
            {selectedInterviewResults && (
              <Typography variant="body2" color="text.secondary">
                {selectedInterviewResults.interview.candidate.name} - {selectedInterviewResults.interview.job.title}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {selectedInterviewResults?.overallScore}%
            </Typography>
            <Assessment color="primary" sx={{ fontSize: 40 }} />
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedInterviewResults && (
            <Box>
              {/* Candidate & Interview Info */}
              <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Candidate Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {selectedInterviewResults.interview.candidate.name?.charAt(0) || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedInterviewResults.interview.candidate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedInterviewResults.interview.candidate.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Interview Details
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Position:</strong> {selectedInterviewResults.interview.job.title}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Company:</strong> {selectedInterviewResults.interview.job.company}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Interviewer:</strong> {selectedInterviewResults.interviewer.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(selectedInterviewResults.interview.scheduledDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Competency Evaluations */}
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Detailed Competency Analysis
              </Typography>
              
              <Grid container spacing={2}>
                {selectedInterviewResults.competencyEvaluations.map((evaluation, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {evaluation.competency}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={evaluation.level.toUpperCase()} 
                              color={evaluation.score >= 85 ? 'success' : evaluation.score >= 70 ? 'warning' : 'error'}
                              size="small"
                            />
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {evaluation.score}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={evaluation.score}
                          color={evaluation.score >= 85 ? 'success' : evaluation.score >= 70 ? 'warning' : 'error'}
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                        />
                        
                        <Typography variant="body2" paragraph>
                          <strong>Feedback:</strong> {evaluation.feedback}
                        </Typography>
                        
                        <Typography variant="body2" color="success.main" paragraph>
                          <strong>Strengths:</strong> {evaluation.strengths}
                        </Typography>
                        
                        <Typography variant="body2" color="warning.main">
                          <strong>Areas for Improvement:</strong> {evaluation.areasForImprovement}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* AI Analysis Section */}
              {selectedInterviewResults.aiAnalysis && (
                <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f0f8ff', border: '2px solid #1976d2' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Psychology color="primary" sx={{ fontSize: 32, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        AI Analysis & Confidence Score
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        AI-Assisted Interview Evaluation
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="bold" color="primary">
                        {(selectedInterviewResults.aiAnalysis.overallConfidence * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        AI Confidence
                      </Typography>
                    </Box>
                  </Box>

                  {/* AI Confidence Breakdown */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {Object.entries(selectedInterviewResults.aiAnalysis.confidenceBreakdown).map(([skill, confidence]) => (
                      <Grid item xs={12} sm={6} md={4} key={skill}>
                        <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            {skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={confidence * 100}
                            color={confidence >= 0.8 ? 'success' : confidence >= 0.6 ? 'warning' : 'error'}
                            sx={{ mb: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            {(confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* AI Insights */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    🤖 AI Insights
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {selectedInterviewResults.aiAnalysis.aiInsights.map((insight, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'white', 
                          borderRadius: 2, 
                          border: '1px solid #e0e0e0',
                          borderLeft: '4px solid #1976d2'
                        }}>
                          <Typography variant="body2">
                            {insight}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* AI Recommendations */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    🎯 AI Recommendations
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {selectedInterviewResults.aiAnalysis.aiRecommendations.map((recommendation, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'white', 
                          borderRadius: 2, 
                          border: '1px solid #e0e0e0',
                          borderLeft: '4px solid #4caf50'
                        }}>
                          <Typography variant="body2">
                            {recommendation}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* AI Flags */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    🚩 AI Flags & Notices
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    {selectedInterviewResults.aiAnalysis.aiFlags.map((flag, index) => (
                      <Box key={index} sx={{ 
                        p: 2, 
                        backgroundColor: 'white', 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        borderLeft: `4px solid ${flag.type === 'positive' ? '#4caf50' : flag.type === 'negative' ? '#f44336' : '#ff9800'}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {flag.type === 'positive' && <CheckCircle color="success" sx={{ fontSize: 20 }} />}
                          {flag.type === 'negative' && <Error color="error" sx={{ fontSize: 20 }} />}
                          {flag.type === 'neutral' && <Warning color="warning" sx={{ fontSize: 20 }} />}
                          <Typography variant="body2">
                            {flag.message}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  {/* AI Metrics */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    📊 AI Performance Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(selectedInterviewResults.aiAnalysis.aiMetrics).map(([metric, value]) => (
                      <Grid item xs={12} sm={6} md={4} key={metric}>
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: 'white', 
                          borderRadius: 2, 
                          border: '1px solid #e0e0e0',
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}

              {/* Interview Notes & Recommendations */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Interview Notes & Recommendations
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Interview Notes:</strong> {selectedInterviewResults.interviewNotes}
                </Typography>
                <Typography variant="body2" color="primary.main">
                  <strong>Recommendations:</strong> {selectedInterviewResults.recommendations}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
            {/* Decision Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Button 
                onClick={handleProceedToNextRound}
                variant="contained"
                size="large"
                startIcon={<CheckCircle />}
                color="success"
                sx={{ 
                  minWidth: 200,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  py: 1.5,
                  boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                ✅ Proceed to Next Round
              </Button>
              <Button 
                onClick={handleRejectCandidate}
                variant="contained"
                size="large"
                startIcon={<Error />}
                color="error"
                sx={{ 
                  minWidth: 200,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  py: 1.5,
                  boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(244, 67, 54, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                ❌ Reject Candidate
              </Button>
            </Box>
            
            {/* Divider */}
            <Divider sx={{ my: 1 }} />
            
            {/* Secondary Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  onClick={handleCloseResultsModal}
                  variant="outlined"
                  size="small"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleDownloadResults}
                  variant="outlined"
                  startIcon={<Assessment />}
                  color="primary"
                  size="small"
                >
                  Download Report
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  onClick={handleSendToHM}
                  variant="outlined"
                  startIcon={<Send />}
                  color="primary"
                  size="small"
                >
                  Send to HM
                </Button>
                <Button 
                  onClick={handleSendToCandidate}
                  variant="outlined"
                  startIcon={<Send />}
                  color="secondary"
                  size="small"
                >
                  Send to Candidate
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Interview Scheduler Component
export default InterviewScheduler;

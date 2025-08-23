import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  VideoCall,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  Edit,
  Delete,
  Visibility,
  Add,
  Refresh,
  FilterList,
  Search,
  Person,
  Work,
  CalendarToday,
  AccessTime,
  LocationOn
} from '@mui/icons-material';

const InterviewPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const mockInterviews = [
    {
      id: 1,
      candidate: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        avatar: 'JD'
      },
      job: {
        title: 'Senior Python Developer',
        company: 'TechCorp'
      },
      interviewer: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com'
      },
      scheduledDate: '2024-01-15T10:00:00',
      duration: 60,
      status: 'scheduled',
      type: 'video',
      roomId: 'room_12345',
      notes: 'Technical interview focusing on Python, Django, and system design'
    },
    {
      id: 2,
      candidate: {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        avatar: 'JS'
      },
      job: {
        title: 'Frontend Developer',
        company: 'TechCorp'
      },
      interviewer: {
        name: 'Mike Wilson',
        email: 'mike.wilson@company.com'
      },
      scheduledDate: '2024-01-16T14:00:00',
      duration: 45,
      status: 'completed',
      type: 'video',
      roomId: 'room_67890',
      notes: 'Completed successfully. Strong React skills demonstrated.',
      score: 85
    },
    {
      id: 3,
      candidate: {
        name: 'Alex Brown',
        email: 'alex.brown@email.com',
        avatar: 'AB'
      },
      job: {
        title: 'DevOps Engineer',
        company: 'TechCorp'
      },
      interviewer: {
        name: 'David Lee',
        email: 'david.lee@company.com'
      },
      scheduledDate: '2024-01-17T09:00:00',
      duration: 90,
      status: 'cancelled',
      type: 'in-person',
      roomId: 'room_11111',
      notes: 'Cancelled by candidate due to personal emergency'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInterviews(mockInterviews);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInterviewClick = (interview) => {
    setSelectedInterview(interview);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInterview(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'in-progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Schedule />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      case 'in-progress':
        return <Pending />;
      default:
        return <Schedule />;
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesStatus = filterStatus === 'all' || interview.status === filterStatus;
    const matchesSearch = interview.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getTabInterviews = (tabIndex) => {
    switch (tabIndex) {
      case 0: // All
        return filteredInterviews;
      case 1: // Scheduled
        return filteredInterviews.filter(i => i.status === 'scheduled');
      case 2: // In Progress
        return filteredInterviews.filter(i => i.status === 'in-progress');
      case 3: // Completed
        return filteredInterviews.filter(i => i.status === 'completed');
      case 4: // Cancelled
        return filteredInterviews.filter(i => i.status === 'cancelled');
      default:
        return filteredInterviews;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Interview Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor all interview sessions
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Interviews
                  </Typography>
                  <Typography variant="h4" component="div">
                    {interviews.length}
                  </Typography>
                </Box>
                <VideoCall sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Scheduled
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {interviews.filter(i => i.status === 'scheduled').length}
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {interviews.filter(i => i.status === 'completed').length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Cancelled
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {interviews.filter(i => i.status === 'cancelled').length}
                  </Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search candidates or jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                label="Status Filter"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {/* TODO: Open create interview dialog */}}
              >
                Create Interview
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {/* TODO: Refresh interviews */}}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`All (${filteredInterviews.length})`} />
          <Tab label={`Scheduled (${filteredInterviews.filter(i => i.status === 'scheduled').length})`} />
          <Tab label={`In Progress (${filteredInterviews.filter(i => i.status === 'in-progress').length})`} />
          <Tab label={`Completed (${filteredInterviews.filter(i => i.status === 'completed').length})`} />
          <Tab label={`Cancelled (${filteredInterviews.filter(i => i.status === 'cancelled').length})`} />
        </Tabs>
      </Paper>

      {/* Interviews Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Job Position</TableCell>
              <TableCell>Interviewer</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTabInterviews(activeTab).map((interview) => (
              <TableRow key={interview.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {interview.candidate.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {interview.candidate.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {interview.candidate.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {interview.job.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {interview.job.company}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {interview.interviewer.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(interview.scheduledDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {interview.duration} min
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={interview.type}
                    size="small"
                    color={interview.type === 'video' ? 'primary' : 'default'}
                    icon={interview.type === 'video' ? <VideoCall /> : <Person />}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={interview.status}
                    size="small"
                    color={getStatusColor(interview.status)}
                    icon={getStatusIcon(interview.status)}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleInterviewClick(interview)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {interview.status === 'scheduled' && (
                      <>
                        <Tooltip title="Join Interview">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {/* TODO: Join interview */}}
                          >
                            <VideoCall />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Interview Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedInterview && (
          <>
            <DialogTitle>
              Interview Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Candidate Information
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {selectedInterview.candidate.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {selectedInterview.candidate.name}
                      </Typography>
                      <Typography color="text.secondary">
                        {selectedInterview.candidate.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Job Information
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedInterview.job.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedInterview.job.company}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Interview Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(selectedInterview.scheduledDate)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedInterview.duration} minutes
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedInterview.interviewer.name}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <VideoCall fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedInterview.type} interview
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                {selectedInterview.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedInterview.notes}
                    </Typography>
                  </Grid>
                )}
                {selectedInterview.score && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Interview Score
                    </Typography>
                    <Chip
                      label={`${selectedInterview.score}/100`}
                      color="success"
                      size="large"
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {selectedInterview.status === 'scheduled' && (
                <Button
                  variant="contained"
                  startIcon={<VideoCall />}
                  onClick={() => {/* TODO: Join interview */}}
                >
                  Join Interview
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default InterviewPanel;

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
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
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
  LocationOn,
  Group,
  Star,
  Circle,
  Block,
  DoNotDisturb
} from '@mui/icons-material';
import interviewerService from '../../services/interviewerService';

const InterviewPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCompetency, setFilterCompetency] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total_interviewers: 0,
    available_interviewers: 0,
    average_rating: 0,
    interviews_this_week: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInterviewers();
    loadStats();
  }, []);

  const loadInterviewers = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      
      if (filterCompetency !== 'all') {
        filters.competency = filterCompetency;
      }
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      console.log('🔍 Loading interviewers with filters:', filters);
      const data = await interviewerService.getInterviewers(filters);
      console.log('🔍 Interviewers data received:', data);
      
      // Ensure data is an array - handle both direct array and paginated response
      if (Array.isArray(data)) {
        setPanels(data);
      } else if (data && Array.isArray(data.results)) {
        setPanels(data.results);
      } else if (data && data.count !== undefined && Array.isArray(data.results)) {
        setPanels(data.results);
      } else {
        console.warn('🔍 Unexpected data format:', data);
        setPanels([]);
      }
    } catch (error) {
      console.error('Error loading interviewers:', error);
      setError('Failed to load interviewers: ' + (error.message || 'Unknown error'));
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await interviewerService.getInterviewerStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePanelClick = (panel) => {
    setSelectedPanel(panel);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPanel(null);
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available':
        return 'success';
      case 'busy':
        return 'warning';
      case 'away':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAvailabilityIcon = (availability) => {
    switch (availability) {
      case 'available':
        return <Circle sx={{ color: 'success.main' }} />;
      case 'busy':
        return <Block sx={{ color: 'error.main' }} />;
      case 'away':
        return <DoNotDisturb sx={{ color: 'warning.main' }} />;
      default:
        return <Circle sx={{ color: 'success.main' }} />;
    }
  };

  const filteredPanels = (panels && Array.isArray(panels) ? panels : []).filter(panel => {
    // Handle competency filtering - check technical_skills array
    const matchesCompetency = filterCompetency === 'all' || 
      (panel.technical_skills && Array.isArray(panel.technical_skills) && 
       panel.technical_skills.some(skill => skill.toLowerCase().includes(filterCompetency.toLowerCase())));
    
    // Handle search filtering - check full_name and technical_skills
    const matchesSearch = !searchTerm || 
      (panel.full_name && panel.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (panel.technical_skills && Array.isArray(panel.technical_skills) && 
       panel.technical_skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesCompetency && matchesSearch;
  });

  const getTabPanels = (tabIndex) => {
    switch (tabIndex) {
      case 0: // All Interviewers
        return filteredPanels;
      case 1: // Available Interviewers
        return filteredPanels.filter(p => p.availability_status === 'available');
      case 2: // Python
        return filteredPanels.filter(p => 
          p.technical_skills && Array.isArray(p.technical_skills) && 
          p.technical_skills.some(skill => skill.toLowerCase().includes('python'))
        );
      case 3: // Frontend
        return filteredPanels.filter(p => 
          p.technical_skills && Array.isArray(p.technical_skills) && 
          p.technical_skills.some(skill => skill.toLowerCase().includes('frontend'))
        );
      case 4: // DevOps
        return filteredPanels.filter(p => 
          p.technical_skills && Array.isArray(p.technical_skills) && 
          p.technical_skills.some(skill => skill.toLowerCase().includes('devops'))
        );
      default:
        return filteredPanels;
    }
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
          Manage interviewers by competency and availability
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Interviewers
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total_interviewers}
                </Typography>
              </Box>
              <Group sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Available Interviewers
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {stats.available_interviewers}
                </Typography>
              </Box>
              <Circle sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Average Rating
                </Typography>
                <Typography variant="h4" component="div" color="primary.main">
                  {stats.average_rating}
                </Typography>
              </Box>
              <Person sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Interviews This Week
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {stats.interviews_this_week}
                </Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search interviewers by name or competency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Competency Filter</InputLabel>
              <Select
                value={filterCompetency}
                label="Competency Filter"
                onChange={(e) => setFilterCompetency(e.target.value)}
              >
                <MenuItem value="all">All Competencies</MenuItem>
                <MenuItem value="Python">Python</MenuItem>
                <MenuItem value="React">React</MenuItem>
                <MenuItem value="DevOps">DevOps</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {/* TODO: Open create panel dialog */}}
              >
                Add Interviewer
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {/* TODO: Refresh panels */}}
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
          <Tab label={`All Interviewers (${filteredPanels.length})`} />
          <Tab label={`Available (${filteredPanels.filter(p => p.availability_status === 'available').length})`} />
          <Tab label={`Python (${filteredPanels.filter(p => p.technical_skills && Array.isArray(p.technical_skills) && p.technical_skills.some(skill => skill.toLowerCase().includes('python'))).length})`} />
          <Tab label={`Frontend (${filteredPanels.filter(p => p.technical_skills && Array.isArray(p.technical_skills) && p.technical_skills.some(skill => skill.toLowerCase().includes('frontend'))).length})`} />
          <Tab label={`DevOps (${filteredPanels.filter(p => p.technical_skills && Array.isArray(p.technical_skills) && p.technical_skills.some(skill => skill.toLowerCase().includes('devops'))).length})`} />
        </Tabs>
      </Paper>

      {/* Panels Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Competency</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Average Rating</TableCell>
              <TableCell>Interviews This Week</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTabPanels(activeTab).map((panel) => (
              <TableRow key={panel.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {panel.full_name ? panel.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {panel.full_name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {panel.title || 'Interviewer'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {panel.department || 'General'}
                    </Typography>
                    {panel.technical_skills && Array.isArray(panel.technical_skills) && (
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {panel.technical_skills.slice(0, 3).map((skill, index) => (
                          <Chip key={index} label={skill} size="small" variant="outlined" />
                        ))}
                        {panel.technical_skills.length > 3 && (
                          <Chip label={`+${panel.technical_skills.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={panel.availability_status}
                      size="small"
                      color={panel.availability_status === 'available' ? 'success' : panel.availability_status === 'busy' ? 'error' : 'warning'}
                      icon={getAvailabilityIcon(panel.availability_status)}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Star sx={{ color: 'gold', fontSize: 16 }} />
                    <Typography variant="body2">
                      {panel.average_rating || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {panel.interviews_count || 0} interviews
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={panel.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={panel.is_active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Panel Details">
                      <IconButton
                        size="small"
                        onClick={() => handlePanelClick(panel)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {panel.availability_status === 'available' && (
                      <Tooltip title="Schedule Interview">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {/* TODO: Schedule interview with this interviewer */}}
                        >
                          <Schedule />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit Panel">
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Panel">
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

      {/* Panel Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedPanel && (
          <>
            <DialogTitle>
              {selectedPanel.competency} Panel Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Panel Information
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedPanel.competency}
                    </Typography>
                    <Typography color="text.secondary">
                      {selectedPanel.skill} • {selectedPanel.level}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2} mb={2}>
                    <Chip
                      label={`${selectedPanel.availableMembers}/${selectedPanel.totalMembers} Available`}
                      color={selectedPanel.availableMembers > 0 ? 'success' : 'error'}
                    />
                    <Chip
                      label={`${selectedPanel.averageRating} ★`}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPanel.interviewsThisWeek} interviews conducted this week
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Panel Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip
                      label={selectedPanel.isActive ? 'Active' : 'Inactive'}
                      color={selectedPanel.isActive ? 'success' : 'default'}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip
                      label={selectedPanel.availableMembers > 0 ? 'Available for Interviews' : 'Currently Unavailable'}
                      color={selectedPanel.availableMembers > 0 ? 'success' : 'error'}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Panel Members
                  </Typography>
                  <List>
                    {selectedPanel.members.map((member) => (
                      <ListItem key={member.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {member.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight={500}>
                                {member.name}
                              </Typography>
                              <Chip
                                label={member.availability}
                                size="small"
                                color={getAvailabilityColor(member.availability)}
                                icon={getAvailabilityIcon(member.availability)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {member.email}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <Star sx={{ color: 'gold', fontSize: 14 }} />
                                <Typography variant="caption">
                                  {member.rating} • {member.interviewsThisWeek} interviews this week
                                </Typography>
                              </Box>
                              <Box mt={0.5}>
                                {member.expertise.map((skill, index) => (
                                  <Chip
                                    key={index}
                                    label={skill}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={member.availability !== 'available'}
                          >
                            <Schedule />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              {selectedPanel.availableMembers > 0 && (
                <Button
                  variant="contained"
                  startIcon={<Schedule />}
                  onClick={() => {/* TODO: Schedule interview with this panel */}}
                >
                  Schedule Interview
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

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Work,
  TrendingUp,
  People
} from '@mui/icons-material';

const JobManagement = () => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState(null);

  const jobs = [
    {
      id: 1,
      title: 'Senior Python Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applications: 24,
      posted: '2024-01-15'
    },
    {
      id: 2,
      title: 'React Frontend Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'Contract',
      status: 'Active',
      applications: 18,
      posted: '2024-01-10'
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company: 'Enterprise Inc',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Draft',
      applications: 0,
      posted: '2024-01-08'
    }
  ];

  const handleOpenDialog = (job = null) => {
    setSelectedJob(job);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJob(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'warning';
      case 'Closed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Work color="primary" />
          Job Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Post New Job
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Jobs
              </Typography>
              <Typography variant="h4">{jobs.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Jobs
              </Typography>
              <Typography variant="h4" color="success.main">
                {jobs.filter(job => job.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Applications
              </Typography>
              <Typography variant="h4" color="primary.main">
                {jobs.reduce((sum, job) => sum + job.applications, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Applications/Job
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {Math.round(jobs.reduce((sum, job) => sum + job.applications, 0) / jobs.length)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Jobs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Job Listings
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applications</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{job.title}</Typography>
                    </TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <Chip label={job.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={job.status} 
                        size="small" 
                        color={getStatusColor(job.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People fontSize="small" />
                        {job.applications}
                      </Box>
                    </TableCell>
                    <TableCell>{job.posted}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(job)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Job Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedJob ? 'Edit Job' : 'Post New Job'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Job Title"
                fullWidth
                defaultValue={selectedJob?.title || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Company"
                fullWidth
                defaultValue={selectedJob?.company || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                fullWidth
                defaultValue={selectedJob?.location || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select defaultValue={selectedJob?.type || 'Full-time'}>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select defaultValue={selectedJob?.status || 'Draft'}>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Job Description"
                multiline
                rows={4}
                fullWidth
                placeholder="Enter detailed job description..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Requirements"
                multiline
                rows={3}
                fullWidth
                placeholder="Enter job requirements..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedJob ? 'Update Job' : 'Post Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobManagement; 
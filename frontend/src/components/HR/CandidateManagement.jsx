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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating
} from '@mui/material';
import {
  People,
  Search,
  FilterList,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  Star,
  Visibility
} from '@mui/icons-material';

const CandidateManagement = () => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  const candidates = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      position: 'Senior Python Developer',
      status: 'Applied',
      rating: 4.5,
      experience: '5 years',
      skills: ['Python', 'Django', 'React', 'AWS'],
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 (555) 987-6543',
      position: 'Frontend Developer',
      status: 'Interviewed',
      rating: 4.8,
      experience: '3 years',
      skills: ['React', 'TypeScript', 'Node.js'],
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1 (555) 456-7890',
      position: 'DevOps Engineer',
      status: 'Shortlisted',
      rating: 4.2,
      experience: '4 years',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
      avatar: 'MJ'
    }
  ];

  const handleOpenDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidate(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'info';
      case 'Shortlisted': return 'warning';
      case 'Interviewed': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People color="primary" />
          Candidate Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Search />}>
            Search
          </Button>
          <Button variant="outlined" startIcon={<FilterList />}>
            Filter
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Candidates
              </Typography>
              <Typography variant="h4">{candidates.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New Applications
              </Typography>
              <Typography variant="h4" color="info.main">
                {candidates.filter(c => c.status === 'Applied').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Shortlisted
              </Typography>
              <Typography variant="h4" color="warning.main">
                {candidates.filter(c => c.status === 'Shortlisted').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Interviewed
              </Typography>
              <Typography variant="h4" color="success.main">
                {candidates.filter(c => c.status === 'Interviewed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Candidates Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Candidate List
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{candidate.avatar}</Avatar>
                        <Box>
                          <Typography variant="subtitle2">{candidate.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {candidate.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>{candidate.experience}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {candidate.skills.slice(0, 2).map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                        {candidate.skills.length > 2 && (
                          <Chip label={`+${candidate.skills.length - 2}`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={candidate.rating} readOnly size="small" />
                        <Typography variant="body2">{candidate.rating}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={candidate.status} 
                        size="small" 
                        color={getStatusColor(candidate.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(candidate)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Email />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Candidate Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Candidate Profile
        </DialogTitle>
        <DialogContent>
          {selectedCandidate && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 64, height: 64 }}>{selectedCandidate.avatar}</Avatar>
                  <Box>
                    <Typography variant="h6">{selectedCandidate.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedCandidate.position}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Rating value={selectedCandidate.rating} readOnly size="small" />
                      <Typography variant="body2">{selectedCandidate.rating}/5</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  fullWidth
                  value={selectedCandidate.email}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={selectedCandidate.phone}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Experience"
                  fullWidth
                  value={selectedCandidate.experience}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={selectedCandidate.status}>
                    <MenuItem value="Applied">Applied</MenuItem>
                    <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                    <MenuItem value="Interviewed">Interviewed</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedCandidate.skills.map((skill, index) => (
                    <Chip key={index} label={skill} />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Notes
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Add notes about this candidate..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateManagement; 
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import JobList from '../components/Jobs/JobList';
import JobDescriptionForm from '../components/Jobs/JobDescriptionForm';

const JobsPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [editingJob, setEditingJob] = useState(null);

  const handleCreateNew = () => {
    setEditingJob(null);
    setView('create');
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setView('create');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingJob(null);
  };

  const handleJobSaved = () => {
    setView('list');
    setEditingJob(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('list');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">
          {view === 'list' ? 'Job Descriptions' : (editingJob ? 'Edit Job' : 'Create Job')}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {view === 'create' && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            sx={{ mr: 2 }}
          >
            Back to Jobs
          </Button>
        )}
        {view === 'create' && (
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ mr: 1 }} />
            {editingJob ? 'Edit Job Description' : 'Create Job Description'}
          </Typography>
        )}
      </Box>

      {/* Content */}
      {view === 'list' ? (
        <JobList
          onEditJob={handleEditJob}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <JobDescriptionForm
          job={editingJob}
          onSave={handleJobSaved}
          onCancel={handleBackToList}
        />
      )}
    </Container>
  );
};

export default JobsPage; 
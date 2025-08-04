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
  Person as PersonIcon
} from '@mui/icons-material';
import CandidateList from '../components/Candidates/CandidateList';
import CandidateForm from '../components/Candidates/CandidateForm';

const CandidatesPage = () => {
  const [editingCandidate, setEditingCandidate] = useState(null);

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
  };

  const handleBackToList = () => {
    setEditingCandidate(null);
  };

  const handleCandidateSaved = () => {
    setEditingCandidate(null);
  };

  return (
    <Box sx={{ width: '100%', px: 3, py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setEditingCandidate(null);
          }}
          sx={{ cursor: 'pointer' }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">
          {editingCandidate ? 'Edit Candidate' : 'Candidates'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {editingCandidate && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            sx={{ mr: 2 }}
          >
            Back to Candidates
          </Button>
        )}
        {editingCandidate && (
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Edit Candidate Profile
          </Typography>
        )}
      </Box>

      {/* Content */}
      {editingCandidate ? (
        <CandidateForm
          candidate={editingCandidate}
          onSave={handleCandidateSaved}
          onCancel={handleBackToList}
        />
      ) : (
        <CandidateList
          onEditCandidate={handleEditCandidate}
        />
      )}
    </Box>
  );
};

export default CandidatesPage; 
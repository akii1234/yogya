import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const CandidateRankingTest = () => {
  console.log('🎯 CandidateRankingTest component rendering...');
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎯 Candidate Ranking Test
      </Typography>
      <Alert severity="success">
        The routing is working! Candidate Ranking component is being rendered.
      </Alert>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This is a test component to verify that the navigation and routing are working correctly.
      </Typography>
    </Box>
  );
};

export default CandidateRankingTest; 
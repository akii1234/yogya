import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import AIRecommendationEngine from '../components/HR/AIRecommendationEngine';

const AIRecommendationPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <AIRecommendationEngine />
        </Paper>
      </Container>
    </Box>
  );
};

export default AIRecommendationPage; 
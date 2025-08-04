import React, { useState } from 'react';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import JobBrowse from '../components/Candidate/JobBrowse';
import ApplicationTracker from '../components/Candidate/ApplicationTracker';
import CandidateProfile from '../components/Candidate/CandidateProfile';

const CandidateDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <CandidateProfile />;
      case 1:
        return <JobBrowse />;
      case 2:
        return <ApplicationTracker />;
      default:
        return <CandidateProfile />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, px: 3, pb: 4, bgcolor: '#f9f9f9', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Candidate Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Find your next opportunity and track your applications
        </Typography>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="candidate dashboard tabs">
            <Tab label="My Profile" />
            <Tab label="Browse Jobs" />
            <Tab label="My Applications" />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ mt: 3 }}>
          {renderContent()}
        </Box>
      </Container>
    </Box>
  );
};

export default CandidateDashboard; 
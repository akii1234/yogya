import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import CompetencyFrameworkList from './CompetencyFrameworkList';
import CompetencyList from './CompetencyList';
import InterviewTemplateList from './InterviewTemplateList';

const CompetencyPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`competency-tabpanel-${index}`}
      aria-labelledby={`competency-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#1F2937',
            fontWeight: 600,
            fontSize: '1.75rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          Competency Management
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6B7280',
            fontWeight: 400,
            fontSize: '1rem',
            letterSpacing: '0.01em',
          }}
        >
          Create and manage competency frameworks, individual competencies, and interview templates
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: '#E5E7EB' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="competency management tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '0.01em',
                color: '#6B7280',
                minHeight: 64,
                '&.Mui-selected': {
                  color: '#DB0011',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#DB0011',
                height: 3,
              },
            }}
          >
            <Tab
              label="Competency Frameworks"
              id="competency-tab-0"
              aria-controls="competency-tabpanel-0"
            />
            <Tab
              label="Competencies"
              id="competency-tab-1"
              aria-controls="competency-tabpanel-1"
            />
            <Tab
              label="Interview Templates"
              id="competency-tab-2"
              aria-controls="competency-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <CompetencyFrameworkList />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <CompetencyList />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <InterviewTemplateList />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CompetencyPage; 
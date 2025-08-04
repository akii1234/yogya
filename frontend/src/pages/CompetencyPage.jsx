import React, { useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import CompetencyFrameworkList from '../components/Competency/CompetencyFrameworkList';
import CompetencyList from '../components/Competency/CompetencyList';
import InterviewTemplateList from '../components/Competency/InterviewTemplateList';

const CompetencyPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabLabels = [
    { label: 'Frameworks', icon: '📋' },
    { label: 'Competencies', icon: '🎯' },
    { label: 'Interview Templates', icon: '📝' }
  ];

  return (
    <Box sx={{ width: '100%', px: 3, py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => e.preventDefault()}
          sx={{ cursor: 'pointer' }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">
          Competency Management
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Competency Management
        </Typography>
      </Box>

      {/* Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Manage competency frameworks, individual competencies, and interview templates for structured, 
          competency-based hiring evaluations.
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabLabels.map((tab, index) => (
            <Tab 
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && <CompetencyFrameworkList />}
        {activeTab === 1 && <CompetencyList />}
        {activeTab === 2 && <InterviewTemplateList />}
      </Box>
    </Box>
  );
};

export default CompetencyPage; 
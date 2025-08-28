import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import {
  Assessment,
  List,
  WorkOutline,
  Psychology
} from '@mui/icons-material';

// Import existing competency components
import CompetencyList from '../Competency/CompetencyList';
import CompetencyFrameworkList from '../Competency/CompetencyFrameworkList';
import InterviewTemplateList from '../Competency/InterviewTemplateList';

const CompetencyManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: 'Competency Frameworks',
      icon: <Assessment />,
      component: <CompetencyFrameworkList />
    },
    {
      label: 'Competencies',
      icon: <List />,
      component: <CompetencyList />
    },
    {
      label: 'Interview Templates',
      icon: <WorkOutline />,
      component: <InterviewTemplateList />
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: 'primary.main',
        fontWeight: 600
      }}>
        <Assessment />
        Competency Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage competency frameworks, individual competencies, and interview templates to create comprehensive assessment strategies.
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '1rem',
              fontWeight: 500,
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {tabs[activeTab].component}
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
        <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Frameworks
            </Typography>
            <Typography variant="h4">12</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Competencies
            </Typography>
            <Typography variant="h4">48</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interview Templates
            </Typography>
            <Typography variant="h4">24</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI-Enhanced
            </Typography>
            <Typography variant="h4">85%</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CompetencyManagement; 
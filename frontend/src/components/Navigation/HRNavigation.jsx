import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard,
  Work,
  People,
  Analytics,
  Settings,
  Psychology,
  AutoAwesome
} from '@mui/icons-material';

const HRNavigation = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, page: 'dashboard' },
    { text: 'Job Management', icon: <Work />, page: 'job-management' },
    { text: 'Candidate Management', icon: <People />, page: 'candidate-management' },
    { text: 'AI Recommendations', icon: <Psychology />, page: 'ai-recommendations' },
    { text: 'LLM Question Generator', icon: <AutoAwesome />, page: 'llm-generator' },
    { text: 'Analytics', icon: <Analytics />, page: 'analytics' },
    { text: 'Settings', icon: <Settings />, page: 'settings' }
  ];

  return (
    <Box sx={{ width: 280, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary">
          HR Dashboard
        </Typography>
      </Box>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.page}>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentPage === item.page}
                onClick={() => onPageChange(item.page)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default HRNavigation; 
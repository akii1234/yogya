import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import {
  Work as WorkIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

const CandidateNavigation = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { text: 'Browse Jobs', icon: <WorkIcon />, page: 'jobs' },
    { text: 'My Applications', icon: <DescriptionIcon />, page: 'applications' },
    { text: 'Resume Analyzer', icon: <StarIcon />, page: 'resume-analyzer' },
    { text: 'Playground', icon: <CodeIcon />, page: 'playground' },
  ];

  return (
    <Box>
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#DB0011',
            fontWeight: 700,
            letterSpacing: '-0.05em',
            textAlign: 'center',
          }}
        >
          Yogya
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6B7280',
            textAlign: 'center',
            mt: 0.5,
            fontWeight: 500,
          }}
        >
          Candidate Portal
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            selected={currentPage === item.page}
            onClick={() => onPageChange(item.page)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: '8px',
              backgroundColor: currentPage === item.page ? '#D32F2F' : 'transparent',
              color: currentPage === item.page ? '#FFFFFF' : '#212121',
              '&:hover': {
                backgroundColor: currentPage === item.page ? '#B71C1C' : '#F5F5F5',
              },
              '&.Mui-selected': {
                backgroundColor: '#D32F2F',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#B71C1C',
                },
                '& .MuiListItemIcon-root': {
                  color: '#FFFFFF',
                },
                '& .MuiListItemText-primary': {
                  color: '#FFFFFF',
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: currentPage === item.page ? '#FFFFFF' : '#757575',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiListItemText-primary': {
                  color: currentPage === item.page ? '#FFFFFF' : '#212121',
                  fontWeight: currentPage === item.page ? 600 : 400,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CandidateNavigation; 
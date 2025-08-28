import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Dashboard,
  Schedule,
  Assessment,
  Psychology,
  Analytics,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  QuestionAnswer
} from '@mui/icons-material';

const InterviewerNavigation = ({ currentPage, onPageChange, isCollapsed = false, onToggleCollapse }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, page: 'dashboard' },
    { text: 'My Interviews', icon: <Schedule />, page: 'interviews' },
    { text: 'Competency Questions', icon: <QuestionAnswer />, page: 'competency-questions' },
    { text: 'Competency Management', icon: <Assessment />, page: 'competency-management' },
    { text: 'AI Assistant', icon: <Psychology />, page: 'ai-assistant' },
    { text: 'Analytics', icon: <Analytics />, page: 'analytics' },
    { text: 'Settings', icon: <Settings />, page: 'settings' }
  ];

  return (
    <Box sx={{ 
      width: isCollapsed ? 80 : 280, 
      bgcolor: 'background.paper',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Yogya Logo */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Collapse in={!isCollapsed} orientation="horizontal">
          <Box>
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
              Interviewer Portal
            </Typography>
          </Box>
        </Collapse>
        
        {/* Toggle Button */}
        <IconButton
          onClick={onToggleCollapse}
          sx={{
            color: '#DB0011',
            '&:hover': {
              backgroundColor: 'rgba(219, 0, 17, 0.1)',
            }
          }}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Navigation List */}
      <List sx={{ 
        pt: 2, 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#E0E0E0',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#BDBDBD',
        },
      }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.page}>
            <ListItem disablePadding>
              <ListItemButton
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
                <Collapse in={!isCollapsed} orientation="horizontal">
                  <ListItemText 
                    primary={item.text} 
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: currentPage === item.page ? 600 : 500,
                      }
                    }}
                  />
                </Collapse>
              </ListItemButton>
            </ListItem>
            {index < menuItems.length - 1 && !isCollapsed && <Divider sx={{ mx: 2 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default InterviewerNavigation;

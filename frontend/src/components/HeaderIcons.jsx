import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  NotificationsNone as NotificationsNoneIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';

const HeaderIcons = ({ onPageChange }) => {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  
  // Mock notification data - replace with real data later
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'Application submitted successfully for Python Backend Developer at Wipro',
      time: '2 hours ago',
      read: false,
      type: 'application'
    },
    {
      id: 2,
      message: 'Your profile was viewed by 3 companies',
      time: '1 day ago',
      read: false,
      type: 'profile'
    },
    {
      id: 3,
      message: 'New job matches found for your skills (5 new positions)',
      time: '2 days ago',
      read: true,
      type: 'job'
    },
    {
      id: 4,
      message: 'Application status updated: DevOps Engineer - Under Review',
      time: '3 days ago',
      read: true,
      type: 'status'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setNotificationAnchor(null);
    setSettingsAnchor(null);
  };

  const handleNotificationItemClick = (notification) => {
    // Handle notification click - could navigate to specific page
    console.log('Notification clicked:', notification);
    
    // Mark as read if not already read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    handleClose();
  };

  const markAsRead = (notificationId) => {
    // Update the notification to read status
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleSettingsItemClick = (setting) => {
    // Handle settings click
    console.log('Setting clicked:', setting);
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return '📝';
      case 'interview':
        return '🎯';
      case 'profile':
        return '👁️';
      case 'job':
        return '💼';
      case 'status':
        return '🔄';
      default:
        return '📢';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Notifications Icon */}
      <IconButton
        color="inherit"
        onClick={handleNotificationClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      {/* Settings Icon */}
      <IconButton
        color="inherit"
        onClick={handleSettingsClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <SettingsIcon />
      </IconButton>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 400,
            mt: 1,
            '& .MuiMenuItem-root': {
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                Notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {unreadCount} unread
              </Typography>
            </Box>
            {unreadCount > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={markAllAsRead}
                sx={{ 
                  fontSize: '0.75rem',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                }}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>
        
        <Divider />
        
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationItemClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'transparent' : '#f0f8ff',
                '&:hover': {
                  backgroundColor: notification.read ? '#f5f5f5' : '#e6f3ff',
                },
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                <Typography sx={{ fontSize: '1.2rem', mr: 1, mt: 0.2 }}>
                  {getNotificationIcon(notification.type)}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: notification.read ? 400 : 600,
                      color: notification.read ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
                {!notification.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#D32F2F',
                      ml: 1,
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleClose} sx={{ borderTop: '1px solid #e0e0e0' }}>
          <ListItemText>
            <Typography variant="body2" color="primary" sx={{ textAlign: 'center', fontWeight: 500 }}>
              View All Notifications
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1,
            '& .MuiMenuItem-root': {
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8f9fa' }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            Settings
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={() => handleSettingsItemClick('profile')}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Account Settings</Typography>
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleSettingsItemClick('security')}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Privacy & Security</Typography>
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleSettingsItemClick('appearance')}>
          <ListItemIcon>
            <PaletteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Appearance</Typography>
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleSettingsItemClick('language')}>
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Language</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default HeaderIcons; 
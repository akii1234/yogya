import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Notifications,
  Work,
  CheckCircle,
  Schedule,
  Info,
  Warning,
} from '@mui/icons-material';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: 'application',
          title: 'Application Status Updated',
          message: 'Your application for Senior Python Developer at TechCorp has been reviewed.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          status: 'reviewing',
        },
        {
          id: 2,
          type: 'interview',
          title: 'Interview Scheduled',
          message: 'Your interview for Lead Developer position has been scheduled for tomorrow at 2 PM.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: false,
          status: 'scheduled',
        },
        {
          id: 3,
          type: 'match',
          title: 'New Job Match',
          message: 'A new job matching your profile is available: Full Stack Developer at StartupXYZ.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          read: true,
          status: 'new',
        },
        {
          id: 4,
          type: 'application',
          title: 'Application Submitted',
          message: 'Your application for React Developer has been successfully submitted.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: true,
          status: 'submitted',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type, status) => {
    switch (type) {
      case 'application':
        return <Work />;
      case 'interview':
        return <Schedule />;
      case 'match':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reviewing':
        return '#2196F3';
      case 'scheduled':
        return '#9C27B0';
      case 'new':
        return '#4CAF50';
      case 'submitted':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', px: 3, py: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#212121',
          mb: 3,
        }}
      >
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Notifications sx={{ fontSize: 64, color: '#E0E0E0', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#757575', mb: 1 }}>
            No notifications
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            You're all caught up!
          </Typography>
        </Box>
      ) : (
        <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' }}>
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : '#F3F4F6',
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        color: getStatusColor(notification.status),
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {getNotificationIcon(notification.type, notification.status)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            color: '#212121',
                            flexGrow: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(notification.status)}20`,
                            color: getStatusColor(notification.status),
                            fontWeight: 600,
                            ml: 1,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#616161',
                            mb: 1,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#757575',
                          }}
                        >
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default NotificationsPage; 
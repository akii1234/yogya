import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Avatar,
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
          message: 'Your application for Senior Python Developer at BigTech has been reviewed.',
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
          message: 'A new job matching your profile is available: Full Stack Developer at BigTech.',
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#212121',
            mb: 1,
          }}
        >
          Notifications
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#757575',
            fontWeight: 500,
          }}
        >
          Stay updated with your job applications and opportunities
        </Typography>
      </Box>

      {notifications.length === 0 ? (
        <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Notifications sx={{ fontSize: 80, color: '#E0E0E0', mb: 3 }} />
            <Typography variant="h6" sx={{ color: '#757575', mb: 2, fontWeight: 600 }}>
              No notifications
            </Typography>
            <Typography variant="body1" sx={{ color: '#757575' }}>
              You're all caught up! Check back later for updates.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {notifications.map((notification) => (
            <Grid item xs={12} key={notification.id}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                  border: notification.read ? 'none' : '2px solid #E3F2FD',
                  backgroundColor: notification.read ? 'transparent' : '#FAFBFF',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0px 8px 25px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Icon */}
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: `${getStatusColor(notification.status)}15`,
                        color: getStatusColor(notification.status),
                        flexShrink: 0,
                      }}
                    >
                      {getNotificationIcon(notification.type, notification.status)}
                    </Avatar>

                    {/* Content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: notification.read ? 500 : 700,
                            color: '#212121',
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            flexGrow: 1,
                            mr: 2,
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
                            fontSize: '0.75rem',
                            height: 24,
                            flexShrink: 0,
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                          }}
                        />
                      </Box>
                      
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#616161',
                          mb: 1.5,
                          lineHeight: 1.5,
                          fontSize: '0.9rem',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#757575',
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          display: 'block',
                        }}
                      >
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default NotificationsPage; 
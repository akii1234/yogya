import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
} from '@mui/material';

const SettingsPage = () => {
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
        Settings
      </Typography>

      <Box sx={{ maxWidth: 800 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#212121',
              mb: 2,
            }}
          >
            Notifications
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Email Notifications"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Push Notifications"
          />
          <FormControlLabel
            control={<Switch />}
            label="SMS Notifications"
          />
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#212121',
              mb: 2,
            }}
          >
            Privacy
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Profile Visibility"
          />
          <FormControlLabel
            control={<Switch />}
            label="Allow Analytics"
          />
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#212121',
              mb: 2,
            }}
          >
            Account
          </Typography>
          <Button
            variant="outlined"
            sx={{ mr: 2, mb: 2 }}
          >
            Change Password
          </Button>
          <Button
            variant="outlined"
            sx={{ mr: 2, mb: 2 }}
          >
            Update Profile
          </Button>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="outlined"
            color="error"
          >
            Delete Account
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default SettingsPage; 
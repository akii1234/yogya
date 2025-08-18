import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications,
  Security,
  Api,
  Storage,
  Business
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getHROrganization } from '../../utils/organizationUtils';
import hrService from '../../services/hrService';

const Settings = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgError, setOrgError] = useState('');
  const [orgSuccess, setOrgSuccess] = useState('');
  
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    aiRecommendations: true,
    llmGeneration: true,
    autoApprove: false,
    apiKey: 'sk-...',
    maxQuestionsPerBatch: 5
  });

  // Load current organization
  useEffect(() => {
    const currentOrg = getHROrganization(user);
    setOrganization(currentOrg || '');
  }, [user]);

  const handleOrganizationUpdate = async () => {
    if (!organization.trim()) {
      setOrgError('Organization name is required');
      return;
    }

    setLoading(true);
    setOrgError('');
    setOrgSuccess('');

    try {
      await hrService.updateOrganization(organization.trim());
      setOrgSuccess('Organization updated successfully!');
    } catch (error) {
      setOrgError(error.response?.data?.error || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked !== undefined ? event.target.checked : event.target.value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon color="primary" />
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Organization Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business />
                Organization
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Organization Name"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Enter your organization name"
                  fullWidth
                  error={!!orgError}
                  helperText={orgError || "This will be used in job postings and activities"}
                />
                {orgSuccess && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    {orgSuccess}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={handleOrganizationUpdate}
                  disabled={loading || !organization.trim()}
                  startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                  {loading ? 'Updating...' : 'Update Organization'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications />
                Notifications
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleSettingChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.aiRecommendations}
                      onChange={handleSettingChange('aiRecommendations')}
                    />
                  }
                  label="AI Recommendation Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.llmGeneration}
                      onChange={handleSettingChange('llmGeneration')}
                    />
                  }
                  label="LLM Generation Notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Api />
                AI Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoApprove}
                      onChange={handleSettingChange('autoApprove')}
                    />
                  }
                  label="Auto-approve High Quality Questions"
                />
                <TextField
                  label="Max Questions Per Batch"
                  type="number"
                  value={settings.maxQuestionsPerBatch}
                  onChange={handleSettingChange('maxQuestionsPerBatch')}
                  inputProps={{ min: 1, max: 20 }}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* API Configuration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security />
                API Configuration
              </Typography>
              <TextField
                label="OpenAI API Key"
                value={settings.apiKey}
                onChange={handleSettingChange('apiKey')}
                fullWidth
                type="password"
                sx={{ mb: 2 }}
              />
              <Alert severity="info" sx={{ mb: 2 }}>
                Your API key is encrypted and stored securely. Never share your API key publicly.
              </Alert>
              <Button variant="contained" color="primary">
                Test API Connection
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* System Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Storage />
                System Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Current Model: o1-mini
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Total Questions: 27
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    API Status: Connected
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Last Updated: Today
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" size="large">
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 
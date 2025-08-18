import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Business, CheckCircle } from '@mui/icons-material';
import { extractOrganizationFromEmail } from '../../utils/organizationUtils';

const OrganizationSetupModal = ({ 
  open, 
  user, 
  onSave, 
  onClose 
}) => {
  const [organization, setOrganization] = useState('');
  const [suggestedOrg, setSuggestedOrg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set suggested organization from email when modal opens
  React.useEffect(() => {
    if (open && user?.email) {
      const suggested = extractOrganizationFromEmail(user.email);
      setSuggestedOrg(suggested || '');
      setOrganization(suggested || '');
    }
  }, [open, user]);

  const handleSave = async () => {
    if (!organization.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(organization.trim());
      // Modal will be closed by parent component
    } catch (err) {
      setError(err.message || 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      disableBackdropClick
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Business sx={{ color: '#DB0011' }} />
          <Typography variant="h6" component="span">
            Welcome to Yogya!
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          To get started, please confirm your organization details. This will be used throughout the platform.
        </Typography>

        {suggestedOrg && (
          <Alert severity="info" sx={{ mb: 2 }}>
            We detected <strong>{suggestedOrg}</strong> from your email address. 
            You can modify this if needed.
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Organization Name"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Enter your organization name"
          error={!!error}
          helperText={error || "This will be displayed in job postings and activities"}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> This organization name will be used for:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography variant="body2" component="li" color="text.secondary">
            Job postings and descriptions
          </Typography>
          <Typography variant="body2" component="li" color="text.secondary">
            Dashboard activities and notifications
          </Typography>
          <Typography variant="body2" component="li" color="text.secondary">
            Candidate communications
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !organization.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
          sx={{
            backgroundColor: '#DB0011',
            '&:hover': {
              backgroundColor: '#A7000E',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
            }
          }}
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrganizationSetupModal;

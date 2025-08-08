import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const RegisterForm = ({ onSwitchToLogin, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'candidate',
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const { register, error, clearError } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
    if (passwordError) setPasswordError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const { confirm_password, ...registrationData } = formData;
    
    const result = await register(registrationData);
    
    if (result.success) {
      // Show registration success page with auto-login
      onRegistrationSuccess(formData);
    }
    
    setLoading(false);
  };

  // Show loading screen during registration
  if (loading) {
    return <LoadingScreen message="Creating your account..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        width: '100%',
        px: 2, // Add horizontal padding for mobile
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#D32F2F',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                mb: 1,
              }}
            >
              Yogya
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#757575',
                fontWeight: 500,
              }}
            >
              Create your account
            </Typography>
          </Box>

                  {error && (
          <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
            {error}
          </Alert>
        )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="given-name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="family-name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">I am a...</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="I am a..."
                onChange={handleChange}
              >
                <MenuItem value="candidate">Job Seeker / Candidate</MenuItem>
                <MenuItem value="hr">HR Professional / Recruiter</MenuItem>
                <MenuItem value="hiring_manager">Hiring Manager</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirm_password"
              label="Confirm Password"
              type="password"
              id="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              error={!!passwordError}
              helperText={passwordError}
              sx={{ mt: 2 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                Already have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToLogin}
                  sx={{
                    color: '#D32F2F',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };

export default RegisterForm; 
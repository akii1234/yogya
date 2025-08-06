import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Chip, Grid, Card, CardContent } from '@mui/material';
import { getCompleteProfile } from '../../services/candidateService';

const ProfileCompletion = ({ onComplete }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  console.log('🚀 DEBUG: ProfileCompletion component rendered');
  console.log('🚀 DEBUG: onComplete prop:', typeof onComplete);
  console.log('🚀 DEBUG: onComplete prop value:', onComplete);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('🔄 DEBUG: Fetching profile data...');
        const profileData = await getCompleteProfile();
        console.log('✅ DEBUG: Profile data received:', profileData);
        setProfile(profileData);
        setError(null);
        
        // Check if this is the first time showing the profile creation message
        const hasShownProfileMessage = localStorage.getItem('profileCreationMessageShown');
        const isProfileComplete = profileData?.hasResume && profileData?.skills?.length > 0;
        
        // Temporarily clear the flag to show message again (remove this line after testing)
        localStorage.removeItem('profileCreationMessageShown');
        
        if (!hasShownProfileMessage && isProfileComplete) {
          setShowSuccessMessage(true);
          localStorage.setItem('profileCreationMessageShown', 'true');
        }
      } catch (err) {
        console.error('❌ DEBUG: Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleComplete = () => {
    console.log('🚀 DEBUG: handleComplete called');
    if (onComplete) {
      console.log('🚀 DEBUG: Calling onComplete callback');
      onComplete();
    } else {
      console.log('🚀 DEBUG: No onComplete callback provided');
    }
  };



  console.log('🚀 DEBUG: About to render ProfileCompletion JSX');
  console.log('🚀 DEBUG: loading:', loading);
  console.log('🚀 DEBUG: profile:', profile);
  console.log('🚀 DEBUG: error:', error);

    if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Loading your profile...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="h5" gutterBottom color="error">
          Error loading profile
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleComplete}
          sx={{ px: 4, py: 2 }}
        >
          Continue to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            🎉 Welcome, {profile?.first_name || 'User'}!
          </Typography>
          
          {showSuccessMessage && (
            <Typography variant="h6" color="success.main" gutterBottom sx={{ fontWeight: 600 }}>
              ✅ Your profile has been successfully created
            </Typography>
          )}
          
          {profile?.hasResume && (
            <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
              Great! We've extracted {profile.skills?.length || 0} skills from your resume
            </Typography>
          )}
        </Box>

        {/* Skills Display */}
        {profile?.skills?.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                🎯 Extracted Skills ({profile.skills.length})
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These skills were automatically extracted from your resume:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.skills.map((skill, index) => (
                  <Chip 
                    key={index}
                    label={skill}
                    variant="outlined"
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your profile setup is complete! You can now browse jobs and apply to positions.
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => {
              console.log('🚀 DEBUG: Button clicked!');
              handleComplete();
            }}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Go to Dashboard 🚀
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileCompletion;
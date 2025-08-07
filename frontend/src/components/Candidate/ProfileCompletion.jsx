import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Chip, Grid, Card, CardContent, Alert } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { getCompleteProfile, uploadResume } from '../../services/candidateService';

const ProfileCompletion = ({ onComplete }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('resume_file', selectedFile);
      
      await uploadResume(formData);
      
      // Reload profile to get updated skills
      const updatedProfile = await getCompleteProfile();
      setProfile(updatedProfile);
      
      setSelectedFile(null);
      setShowSuccessMessage(true);
      
      // Show success message for a few seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadError('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
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

        {/* Resume Upload Section for New Users */}
        {!profile?.hasResume && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                📄 Complete Your Profile
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload your resume to automatically extract skills and improve your job matches.
                Supported formats: PDF, DOCX, DOC, TXT
              </Typography>
              
              {/* File Upload */}
              <Box sx={{ mb: 3, p: 2, border: '2px dashed #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <UploadIcon color="primary" />
                  <Typography variant="h6">Upload Your Resume</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploading}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileSelect}
                    />
                  </Button>
                  {selectedFile && (
                    <Typography variant="body2">
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                    onClick={handleUploadResume}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </Box>
              </Box>
              
              {/* Upload Error */}
              {uploadError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {uploadError}
                </Alert>
              )}
              
              {/* Success Message */}
              {showSuccessMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ Resume uploaded successfully! Skills have been extracted and added to your profile.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {profile?.hasResume 
              ? "Your profile setup is complete! You can now browse jobs and apply to positions."
              : "Upload your resume to complete your profile and start browsing jobs."
            }
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => {
              console.log('🚀 DEBUG: Button clicked!');
              handleComplete();
            }}
            disabled={!profile?.hasResume}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {profile?.hasResume ? 'Go to Dashboard 🚀' : 'Complete Profile First'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileCompletion;
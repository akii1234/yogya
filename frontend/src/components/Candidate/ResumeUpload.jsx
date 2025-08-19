import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ResumeUpload = ({ userData, onComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a PDF or Word document');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual upload API call
      // const formData = new FormData();
      // formData.append('resume', file);
      // formData.append('user_id', userData.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Simulate success
      setSuccess(true);
      
      // Auto-login after successful upload
      setTimeout(async () => {
        try {
          const result = await login(userData.email, userData.password);
          if (result.success) {
            onComplete();
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }, 1500);

    } catch (error) {
      setError('Failed to upload resume. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const skipUpload = async () => {
    try {
      const result = await login(userData.email, userData.password);
      if (result.success) {
        onComplete();
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        width: '100%',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 600,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#D32F2F',
              fontWeight: 700,
              mb: 1,
            }}
          >
            Welcome to Yogya! 🎉
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#757575',
              mb: 2,
            }}
          >
            Let's get you started by uploading your resume
          </Typography>
        </Box>

        {/* Info Card */}
        <Card sx={{ mb: 3, bgcolor: '#E3F2FD' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <InfoIcon color="primary" />
              <Typography variant="h6" color="primary" fontWeight={600}>
                Why upload your resume?
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Your resume helps us match you with the perfect job opportunities and provides 
              interviewers with context about your experience and skills.
            </Typography>
          </CardContent>
        </Card>

        {/* File Upload Area */}
        <Box sx={{ mb: 3 }}>
          <input
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="resume-file"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="resume-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading}
              sx={{
                width: '100%',
                py: 3,
                border: '2px dashed #ccc',
                borderColor: file ? '#4CAF50' : '#ccc',
                '&:hover': {
                  borderColor: file ? '#4CAF50' : '#999',
                },
              }}
            >
              {file ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileIcon color="success" />
                  <Typography variant="body1" color="success.main">
                    {file.name}
                  </Typography>
                  <CheckIcon color="success" />
                </Box>
              ) : (
                <Typography variant="body1">
                  Click to select your resume (PDF, DOC, DOCX)
                </Typography>
              )}
            </Button>
          </label>
        </Box>

        {/* File Requirements */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            File requirements:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label="PDF, DOC, or DOCX" size="small" variant="outlined" />
            <Chip label="Max 5MB" size="small" variant="outlined" />
            <Chip label="English preferred" size="small" variant="outlined" />
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Resume uploaded successfully! Redirecting to dashboard...
          </Alert>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Uploading resume...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {uploadProgress}% complete
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
            sx={{
              flex: 1,
              py: 1.5,
              bgcolor: '#D32F2F',
              '&:hover': {
                bgcolor: '#B71C1C',
              },
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={skipUpload}
            disabled={uploading}
            sx={{
              flex: 1,
              py: 1.5,
            }}
          >
            Skip for Now
          </Button>
        </Box>

        {/* Skip Note */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          You can always upload your resume later from your profile settings
        </Typography>
      </Paper>
    </Box>
  );
};

export default ResumeUpload;

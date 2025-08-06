import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeResume } from '../../services/candidateService';

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);

  useEffect(() => {
    // Load candidate profile for reference
    const loadProfile = async () => {
      try {
        // This would be replaced with actual API call
        setCandidateProfile({
          skills: ['Python', 'Django', 'React', 'JavaScript', 'SQL', 'Git'],
          experience: 3,
          location: 'Mumbai, India',
          education: 'Bachelor of Technology'
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeResume(jobDescription);
      setAnalysisResult(result);
    } catch (error) {
      let errorMessage = 'Failed to analyze resume. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setError(errorMessage);
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
          <StarIcon sx={{ mr: 1, color: '#FFD700' }} />
          Resume Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Paste a job description to see how well your resume matches
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                📝 Job Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={loading || !jobDescription.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <TrendingUpIcon />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {loading ? 'Analyzing...' : 'Analyze Match'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Analyzing your resume...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This may take a few moments
                </Typography>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <Card elevation={2}>
              <CardContent>
                {/* Overall Score */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                    Overall Match Score
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={analysisResult.overall_score}
                      size={120}
                      thickness={8}
                      color={getScoreColor(analysisResult.overall_score)}
                      sx={{ mb: 1 }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {analysisResult.overall_score}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" color={getScoreColor(analysisResult.overall_score)}>
                    {getScoreLabel(analysisResult.overall_score)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Skills Match */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    🎯 Skills Match ({analysisResult.skills_match.score}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysisResult.skills_match.score}
                    color={getScoreColor(analysisResult.skills_match.score)}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Matched Skills ({analysisResult.skills_match.matched.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {analysisResult.skills_match.matched.map((skill, index) => (
                      <Chip
                        key={index}
                        icon={<CheckCircleIcon />}
                        label={skill}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Missing Skills ({analysisResult.skills_match.missing.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysisResult.skills_match.missing.map((skill, index) => (
                      <Chip
                        key={index}
                        icon={<CancelIcon />}
                        label={skill}
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Experience Match */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    💼 Experience Match ({analysisResult.experience_match.score}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysisResult.experience_match.score}
                    color={getScoreColor(analysisResult.experience_match.score)}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Required: {analysisResult.experience_match.required} years | 
                    Your Experience: {analysisResult.experience_match.candidate} years
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Location Match */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    📍 Location Match ({analysisResult.location_match.score}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysisResult.location_match.score}
                    color={getScoreColor(analysisResult.location_match.score)}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Your Location: {analysisResult.location_match.candidate} | 
                    Job Location: {analysisResult.location_match.job}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Recommendations */}
                <Box>
                  <Typography variant="h6" gutterBottom color="primary">
                    <LightbulbIcon sx={{ mr: 1, color: '#FFD700' }} />
                    Recommendations
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {analysisResult.recommendations.map((rec, index) => (
                      <Typography
                        key={index}
                        component="li"
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResumeAnalyzer; 
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeResume, getCompleteProfile } from '../../services/candidateService';

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Load candidate profile for reference
    const loadProfile = async () => {
      try {
        console.log('🔄 Loading actual candidate profile...');
        const profileData = await getCompleteProfile();
        console.log('📊 Loaded profile data:', profileData);
        
        setCandidateProfile({
          skills: profileData.skills || [],
          experience: profileData.total_experience_years || 0,
          location: `${profileData.city || ''}, ${profileData.state || ''}, ${profileData.country || ''}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, '') || 'Not specified',
          education: profileData.education || 'Not specified',
          fullName: profileData.full_name || 'Not specified'
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to empty profile if API fails
        setCandidateProfile({
          skills: [],
          experience: 0,
          location: 'Not specified',
          education: 'Not specified',
          fullName: 'Not specified'
        });
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // Rotating loading messages
  useEffect(() => {
    console.log('🔄 Loading state changed:', loading);
    if (loading) {
      console.log('🔄 Starting loading animations...');
      // Set initial random message
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingMessage(loadingMessages[randomIndex]);
      console.log('🔄 Initial message:', loadingMessages[randomIndex]);

      // Rotate messages every 3.5 seconds for more engaging experience
      const messageInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        setLoadingMessage(loadingMessages[randomIndex]);
        console.log('🔄 Rotated message:', loadingMessages[randomIndex]);
      }, 3500);

      // Progress through steps - slower for more engaging experience
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev < progressSteps.length - 1 ? prev + 1 : prev;
          console.log('🔄 Progress step:', nextStep);
          return nextStep;
        });
      }, 1500); // Slower progression - 1.5 seconds per step

      return () => {
        console.log('🔄 Cleaning up intervals...');
        clearInterval(messageInterval);
        clearInterval(stepInterval);
      };
    } else {
      console.log('🔄 Stopping loading animations...');
      setCurrentStep(0);
      setLoadingMessage('');
    }
  }, [loading]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Ensure minimum loading time of 6 seconds to show the beautiful loading experience
    const startTime = Date.now();
    const minLoadingTime = 6000; // 6 seconds

    try {
      const result = await analyzeResume(jobDescription);
      
      // Calculate remaining time to ensure minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      setAnalysisResult(result);
      setIsModalOpen(true); // Open modal with results
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Loading messages and progress steps
  const loadingMessages = [
    "Good things take time, and so does perfect analysis! ⏳",
    "I may be a system, but I'm taking my time to create perfection ✨",
    "Analyzing your skills with precision and care... 🎯",
    "Quality analysis requires thoughtful consideration... 🤔",
    "Your resume deserves the best analysis possible... 💎",
    "Crunching data, matching skills, finding your perfect fit... 🔍",
    "Every detail matters in this analysis... 🔬",
    "Building the perfect match takes time... 🏗️",
    "Processing with AI-powered intelligence... 🧠",
    "Creating insights that matter for your career... 📈",
    "Taking a deep dive into your professional journey... 🌊",
    "Crafting the perfect analysis just for you... 🎨",
    "Your future career path is being mapped out... 🗺️",
    "Analyzing every skill with laser precision... ⚡",
    "Building bridges between your experience and opportunities... 🌉",
    "Your potential is being carefully evaluated... 🔮",
    "Creating a masterpiece of career insights... 🎭",
    "Every skill tells a story, and I'm reading yours... 📖",
    "Preparing insights that will shape your career... 🚀",
    "Your professional DNA is being decoded... 🧬"
  ];

  const progressSteps = [
    { name: "Skills Analysis", icon: "🎯", description: "Extracting and matching your technical skills" },
    { name: "Experience Evaluation", icon: "💼", description: "Comparing your experience with job requirements" },
    { name: "Location Matching", icon: "📍", description: "Analyzing location and remote work compatibility" },
    { name: "Final Scoring", icon: "📊", description: "Calculating your overall match score" }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <Card elevation={2} sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            {/* Animated Circular Progress */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
              <CircularProgress 
                size={80} 
                thickness={4}
                sx={{ 
                  color: 'primary.main',
                  animation: 'pulse 2s ease-in-out infinite'
                }} 
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
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {Math.round(((currentStep + 1) / progressSteps.length) * 100)}%
                </Typography>
              </Box>
            </Box>

            {/* Rotating Message */}
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ 
                mb: 3, 
                fontWeight: 500,
                minHeight: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loadingMessage}
            </Typography>

            {/* Progress Steps */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Analysis Progress
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {progressSteps.map((step, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      opacity: index <= currentStep ? 1 : 0.4,
                      transition: 'opacity 0.5s ease',
                      transform: index <= currentStep ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        mb: 1,
                        bgcolor: index <= currentStep ? 'primary.main' : 'grey.300',
                        color: index <= currentStep ? 'white' : 'grey.600',
                        transition: 'all 0.5s ease',
                        animation: index === currentStep ? 'pulse 1s ease-in-out infinite' : 'none',
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography 
                      variant="caption" 
                      color={index <= currentStep ? 'primary.main' : 'text.secondary'}
                      sx={{ 
                        fontWeight: index <= currentStep ? 600 : 400,
                        textAlign: 'center',
                        maxWidth: 80
                      }}
                    >
                      {step.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Current Step Description */}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontStyle: 'italic',
                opacity: 0.8
              }}
            >
              {progressSteps[currentStep]?.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <Card elevation={2} sx={{ maxWidth: 800, mx: 'auto' }}>
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

      {/* Results Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            width: '95vw',
            maxWidth: '1200px',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
            <StarIcon sx={{ mr: 1, color: '#FFD700' }} />
            Analysis Results
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 0 }}>
          {analysisResult && (
            <Box>
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
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseModal}
            sx={{ minWidth: 100 }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCloseModal}
            sx={{ minWidth: 100 }}
          >
            Analyze Another
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeAnalyzer; 
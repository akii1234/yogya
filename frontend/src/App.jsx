import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

// Import components
import AuthPage from './components/Auth/AuthPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HRNavigation from './components/Navigation/HRNavigation';
import CandidateNavigation from './components/Navigation/CandidateNavigation';
import ComprehensiveDashboard from './pages/ComprehensiveDashboard';
import JobList from './components/Jobs/JobList';
import JobDescriptionForm from './components/Jobs/JobDescriptionForm';
import CandidateList from './components/Candidates/CandidateList';
import CompetencyManagement from './components/HR/CompetencyManagement';
import AIRecommendationEngine from './components/HR/AIRecommendationEngine';
import LLMQuestionGenerator from './components/HR/LLMQuestionGenerator';
import Settings from './components/HR/Settings';
import JobBrowse from './components/Candidate/JobBrowse';
import ApplicationTracker from './components/Candidate/ApplicationTracker';
import CandidateProfile from './components/Candidate/CandidateProfile';
import ResumeAnalyzer from './components/Candidate/ResumeAnalyzer';
import ProfileCompletion from './components/Candidate/ProfileCompletion';
import LoadingScreen from './components/Auth/LoadingScreen';
import Playground from './components/Candidate/Playground';
import UserProfileDropdown from './components/UserProfileDropdown';
import HeaderIcons from './components/HeaderIcons';
import { useAuth } from './contexts/AuthContext';
import { checkProfileCompletion } from './services/candidateService';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#db0011',
      dark: '#a8000d',
      light: '#ff1a1a',
    },
    secondary: {
      main: '#0066cc',
      dark: '#004499',
      light: '#3399ff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", "Monaco", "Cascadia Code", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  const { user, login, logout, isHR, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('jobs');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const refreshJobsRef = useRef(null);
  const theme_ = useTheme();
  const isMobile = useMediaQuery(theme_.breakpoints.down('md'));

  // Enhanced profile completion check with better logic
  useEffect(() => {
    const checkCandidateProfile = async () => {
      console.log('🔍 DEBUG: App useEffect triggered');
      console.log('🔍 DEBUG: user:', user);
      console.log('🔍 DEBUG: user.role:', user?.role);
      
      if (user && user.role === 'candidate') {
        console.log('🔍 DEBUG: User is candidate, checking profile...');
        try {
          setCheckingProfile(true);
          console.log('🔍 DEBUG: setCheckingProfile(true) called');
          
          // Check if profile is complete using the API
          const completionResult = await checkProfileCompletion();
          console.log('🔍 DEBUG: Profile completion check result:', completionResult);
          
          // Always show profile completion page for candidates to display welcome message and skills
          setShowProfileCompletion(true);
          setCheckingProfile(false);
          
        } catch (error) {
          console.error('❌ DEBUG: Error in profile check:', error);
          // If API fails, assume profile is not complete
          setShowProfileCompletion(true);
          setCheckingProfile(false);
        }
      } else {
        console.log('🔍 DEBUG: User is not candidate or no user');
        setCheckingProfile(false);
        setShowProfileCompletion(false);
      }
    };

    checkCandidateProfile();
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setJobFormOpen(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobFormOpen(true);
  };

  const handleCloseJobForm = () => {
    setJobFormOpen(false);
    setEditingJob(null);
  };

  const handleProfileCompletionComplete = () => {
    console.log('🔍 DEBUG: handleProfileCompletionComplete called');
    console.log('🔍 DEBUG: Setting showProfileCompletion to false');
    setShowProfileCompletion(false);
    console.log('🔍 DEBUG: Setting currentPage to jobs (candidate default)');
    setCurrentPage('jobs');
    console.log('🔍 DEBUG: handleProfileCompletionComplete completed');
  };

  const renderPage = () => {
    if (isHR()) {
      switch (currentPage) {
        case 'dashboard':
          return <ComprehensiveDashboard />;
        case 'job-management':
          return (
            <>
              <JobList onEditJob={handleEditJob} onCreateNew={handleCreateJob} refreshJobs={refreshJobsRef} />
              {jobFormOpen && (
                <Dialog
                  open={jobFormOpen}
                  onClose={handleCloseJobForm}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogTitle>
                    {editingJob ? 'Edit Job Description' : 'Create New Job Description'}
                  </DialogTitle>
                  <DialogContent>
                    <JobDescriptionForm
                      job={editingJob}
                      onSave={(savedJob) => {
                        handleCloseJobForm();
                        // Refresh the job list to show the newly created/updated job
                        if (refreshJobsRef.current) {
                          refreshJobsRef.current();
                        }
                      }}
                      onCancel={handleCloseJobForm}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </>
          );
        case 'candidate-management':
          return <CandidateList />;
        case 'competency-management':
          return <CompetencyManagement />;
        case 'ai-recommendations':
          return <AIRecommendationEngine />;
        case 'llm-generator':
          return <LLMQuestionGenerator />;
        case 'analytics':
          return <ComprehensiveDashboard defaultTab={1} />;
        case 'settings':
          return <Settings />;
        default:
          return <ComprehensiveDashboard />;
      }
    } else {
      switch (currentPage) {
        case 'jobs':
          return <JobBrowse />;
        case 'applications':
          return <ApplicationTracker />;
        case 'resume-analyzer':
          return <ResumeAnalyzer />;
        case 'playground':
          return <Playground />;
        case 'profile':
          return <CandidateProfile />;
        default:
          return <JobBrowse />;
      }
    }
  };

  const drawer = isHR() ? (
    <HRNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
  ) : (
    <CandidateNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
  );

  console.log('🔍 DEBUG: Main render logic - user:', !!user);
  console.log('🔍 DEBUG: checkingProfile:', checkingProfile);
  console.log('🔍 DEBUG: showProfileCompletion:', showProfileCompletion);
  console.log('🔍 DEBUG: user.role:', user?.role);
  console.log('🔍 DEBUG: authLoading:', authLoading);

  // Show loading screen when auth is loading (but not when user is actively logging in from LoginForm)
  if (authLoading && !user) {
    // Only show App's LoadingScreen during initial auth check, not during login
    // Check if this is the initial app load (no stored auth data) vs active login
    const hasStoredAuth = localStorage.getItem('authToken') || localStorage.getItem('user');
    
    if (!hasStoredAuth) {
      // Initial auth check - show App's LoadingScreen
      console.log('🔍 DEBUG: Initial auth check, showing LoadingScreen');
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LoadingScreen 
            message="Authenticating your session..." 
            role={user?.role || null}
            onRoleDetected={(role) => {
              console.log('🎯 Role detected in App:', role);
              if (role === 'completed') {
                console.log('🎯 Auth loading completed');
              }
            }}
          />
        </ThemeProvider>
      );
    } else {
      // User is actively logging in - let LoginForm handle the loading
      console.log('🔍 DEBUG: User is actively logging in, letting LoginForm handle loading');
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthPage />
        </ThemeProvider>
      );
    }
  }

  if (!user) {
    console.log('🔍 DEBUG: No user, showing AuthPage');
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthPage />
      </ThemeProvider>
    );
  }

  // Show loading while checking profile for candidates
  if (checkingProfile && user.role === 'candidate') {
    console.log('🔍 DEBUG: Checking profile, showing LoadingScreen');
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingScreen 
          message="Preparing your personalized experience..." 
          role={user.role}
          onRoleDetected={(role) => {
            console.log('🎯 Role detected for candidate profile:', role);
            if (role === 'completed') {
              console.log('🎯 Profile checking completed');
              setCheckingProfile(false);
            }
          }}
        />
      </ThemeProvider>
    );
  }

  // Show profile completion for candidates who haven't completed their profile
  if (showProfileCompletion && user.role === 'candidate') {
    console.log('🔍 DEBUG: Showing ProfileCompletion component');
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProfileCompletion onComplete={handleProfileCompletionComplete} />
      </ThemeProvider>
    );
  }

  // Profile completion logic is now working properly

  console.log('🔍 DEBUG: Showing main dashboard/app');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - 280px)` },
            ml: { md: `280px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Yogya - {isHR() ? 'HR Dashboard' : 'Candidate Portal'}
            </Typography>
            <HeaderIcons onPageChange={setCurrentPage} />
            <UserProfileDropdown onPageChange={setCurrentPage} />
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - 280px)` },
            mt: 8,
          }}
        >
          {renderPage()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

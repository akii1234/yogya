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
import CompetencyManagement from './components/Competency/CompetencyManagement';
import AIRecommendationEngine from './components/AI/AIRecommendationEngine';
import LLMQuestionGenerator from './components/HR/LLMQuestionGenerator';
import CandidateRanking from './components/HR/CandidateRanking';
import CandidateRankingTest from './components/HR/CandidateRankingTest';
import InterviewScheduler from './components/HR/InterviewScheduler';
import InterviewPanel from './components/HR/InterviewPanel';
import CompetencyQuestionsScreen from './components/Interviewer/CompetencyQuestionsScreen';
import EnhancedInterviewInterface from './components/Interviewer/EnhancedInterviewInterface';
import InterviewerDashboard from './components/Interviewer/InterviewerDashboard';
import InterviewerNavigation from './components/Navigation/InterviewerNavigation';
import VideoCallTest from './components/Interviewer/VideoCallTest';
import Settings from './components/HR/Settings';
import JobBrowse from './components/Candidate/JobBrowse';
import ApplicationTracker from './components/Candidate/ApplicationTracker';
import CandidateProfile from './components/Candidate/CandidateProfile';
import ResumeAnalyzer from './components/Candidate/ResumeAnalyzer';
import ProfileCompletion from './components/Candidate/ProfileCompletion';
import LoadingScreen from './components/Auth/LoadingScreen';
import Playground from './components/Candidate/Playground';
import InterviewManager from './components/Candidate/InterviewManager';
import UserProfileDropdown from './components/UserProfileDropdown';
import HeaderIcons from './components/HeaderIcons';
import { useAuth } from './contexts/AuthContext';
import { checkProfileCompletion } from './services/candidateService';
import OrganizationSetupModal from './components/HR/OrganizationSetupModal';
import { hasOrganizationSet } from './utils/organizationUtils';
import hrService from './services/hrService';

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
  const { user, login, logout, isHR, isInterviewer, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('jobs');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showOrganizationSetup, setShowOrganizationSetup] = useState(false);
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

  // Check organization setup for HR users
  useEffect(() => {
    if (user && user.role === 'hr' && !hasOrganizationSet(user)) {
      setShowOrganizationSetup(true);
    }
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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

  const handleOrganizationSetup = async (organization) => {
    try {
      // Call API to save organization to HR profile
      await hrService.updateOrganization(organization);
      console.log('Organization saved successfully:', organization);
      setShowOrganizationSetup(false);
      
      // Refresh user data to include the new organization
      // This will trigger a re-render with the updated user data
      window.location.reload();
    } catch (error) {
      console.error('Error saving organization:', error);
      throw error;
    }
  };

  const handleOrganizationSetupClose = () => {
    // Don't allow closing without setting organization
    console.log('Organization setup close attempted - blocking');
  };

  const renderPage = () => {
    if (isInterviewer()) {
      switch (currentPage) {
        case 'dashboard':
          return <InterviewerDashboard />;
        case 'interviews':
          return <InterviewManager />;
        case 'competency-questions':
          return <EnhancedInterviewInterface 
            interviewId="INT-001" 
            onComplete={(data) => console.log('Interview completed:', data)}
            onClose={() => setCurrentPage('dashboard')}
          />;
        case 'competency-management':
          return <CompetencyManagement />;
        case 'ai-recommendations':
          return <AIRecommendationEngine />;
        case 'ai-assistant':
          return <VideoCallTest />;
        case 'analytics':
          return <div>Interviewer Analytics (Coming Soon)</div>;
        case 'settings':
          return <Settings />;
        default:
          return <InterviewerDashboard />;
      }
    } else if (isHR()) {
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
        case 'candidate-rankings':
          return <CandidateRanking />;
        case 'interview-scheduler':
          return <InterviewScheduler />;
        case 'interview-panel':
          return <InterviewPanel />;
        case 'competency-questions':
          return <CompetencyQuestionsScreen />;
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
        case 'interviews':
          return <InterviewManager />;
        case 'video-test':
          return <VideoCallTest />;
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

  const drawer = isInterviewer() ? (
    <InterviewerNavigation 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      isCollapsed={sidebarCollapsed}
      onToggleCollapse={handleSidebarToggle}
    />
  ) : isHR() ? (
    <HRNavigation 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      isCollapsed={sidebarCollapsed}
      onToggleCollapse={handleSidebarToggle}
    />
  ) : (
    <CandidateNavigation 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      isCollapsed={sidebarCollapsed}
      onToggleCollapse={handleSidebarToggle}
    />
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
            width: { 
              md: sidebarCollapsed 
                ? `calc(100% - 80px)` 
                : `calc(100% - 280px)` 
            },
            ml: { 
              md: sidebarCollapsed 
                ? '80px' 
                : '280px' 
            },
            transition: 'width 0.3s ease, margin-left 0.3s ease',
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
              Yogya - {isInterviewer() ? 'Interviewer Portal' : isHR() ? 'HR Dashboard' : 'Candidate Portal'}
            </Typography>
            <HeaderIcons onPageChange={setCurrentPage} />
            <UserProfileDropdown onPageChange={setCurrentPage} />
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ 
            width: { 
              md: sidebarCollapsed 
                ? 80 
                : 280 
            }, 
            flexShrink: { md: 0 },
            transition: 'width 0.3s ease',
          }}
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
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 280,
                overflow: 'hidden',
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: sidebarCollapsed ? 80 : 280,
                overflow: 'hidden',
                transition: 'width 0.3s ease',
              },
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
            width: { 
              md: sidebarCollapsed 
                ? `calc(100% - 80px)` 
                : `calc(100% - 280px)` 
            },
            mt: 8,
            transition: 'width 0.3s ease',
          }}
        >
          {renderPage()}
        </Box>
      </Box>

      {/* Organization Setup Modal for HR Users */}
      <OrganizationSetupModal
        open={showOrganizationSetup}
        user={user}
        onSave={handleOrganizationSetup}
        onClose={handleOrganizationSetupClose}
      />
    </ThemeProvider>
  );
}

export default App;

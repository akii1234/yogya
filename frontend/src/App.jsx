import React, { useState, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

// Import components
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HRNavigation from './components/Navigation/HRNavigation';
import CandidateNavigation from './components/Navigation/CandidateNavigation';
import DashboardOverview from './components/HR/DashboardOverview';
import JobManagement from './components/HR/JobManagement';
import CandidateManagement from './components/HR/CandidateManagement';
import CompetencyManagement from './components/HR/CompetencyManagement';
import AIRecommendationEngine from './components/HR/AIRecommendationEngine';
import LLMQuestionGenerator from './components/HR/LLMQuestionGenerator';
import AnalyticsDashboard from './components/HR/Analytics';
import Settings from './components/HR/Settings';
import CandidateDashboard from './components/Candidate/CandidateDashboard';
import JobBrowse from './components/Candidate/JobBrowse';
import ApplicationTracker from './components/Candidate/ApplicationTracker';
import CandidateProfile from './components/Candidate/CandidateProfile';
import { useAuth } from './contexts/AuthContext';

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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
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
  const { user, login, logout, isHR } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme_ = useTheme();
  const isMobile = useMediaQuery(theme_.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderPage = () => {
    if (isHR()) {
      switch (currentPage) {
        case 'dashboard':
          return <DashboardOverview />;
        case 'job-management':
          return <JobManagement />;
        case 'candidate-management':
          return <CandidateManagement />;
        case 'competency-management':
          return <CompetencyManagement />;
        case 'ai-recommendations':
          return <AIRecommendationEngine />;
        case 'llm-generator':
          return <LLMQuestionGenerator />;
        case 'analytics':
          return <AnalyticsDashboard />;
        case 'settings':
          return <Settings />;
        default:
          return <DashboardOverview />;
      }
    } else {
      switch (currentPage) {
        case 'dashboard':
          return <CandidateDashboard />;
        case 'jobs':
          return <JobBrowse />;
        case 'applications':
          return <ApplicationTracker />;
        case 'profile':
          return <CandidateProfile />;
        case 'notifications':
          return <CandidateDashboard />; // Placeholder for notifications
        case 'settings':
          return <CandidateDashboard />; // Placeholder for settings
        default:
          return <CandidateDashboard />;
      }
    }
  };

  const drawer = isHR() ? (
    <HRNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
  ) : (
    <CandidateNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
  );

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <LoginForm onLogin={login} />
        </Container>
      </ThemeProvider>
    );
  }

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
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
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

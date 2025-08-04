import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Person,
} from '@mui/icons-material';

// Import components
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import HRNavigation from './components/Navigation/HRNavigation';
import CandidateNavigation from './components/Navigation/CandidateNavigation';

// Import pages
import Dashboard from './components/Dashboard/DashboardOverview';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import CompetencyPage from './components/Competency/CompetencyPage';
import AIRecommendationEngine from './components/HR/AIRecommendationEngine';
import CandidateDashboard from './pages/CandidateDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import BrowseJobsPage from './pages/BrowseJobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import MyProfilePage from './pages/MyProfilePage';
import NotificationsPage from './pages/NotificationsPage';

// HSBC-inspired theme with Apple-inspired typography
const theme = createTheme({
  palette: {
    primary: {
      main: '#D32F2F', // Primary Red from Figma spec
      light: '#FF1A1A',
      dark: '#B71C1C', // Button Hover Red from Figma spec
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#212121', // Text Dark Gray from Figma spec
      light: '#757575', // Text Light Gray from Figma spec
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFAFA', // Background from Figma spec
      paper: '#FFFFFF', // Card Background from Figma spec
    },
    text: {
      primary: '#212121', // Text Dark Gray from Figma spec
      secondary: '#757575', // Text Light Gray from Figma spec
    },
    success: {
      main: '#388E3C', // Status Green (Active) from Figma spec
    },
    grey: {
      300: '#E0E0E0', // Button Border Gray from Figma spec
      400: '#BDBDBD', // Edit button border
      500: '#9E9E9E', // Footer timestamp
      600: '#757575', // Secondary text
      700: '#616161', // Description text
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700, // Inter Bold
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      fontFamily: 'Inter, sans-serif',
    },
    h2: {
      fontWeight: 700, // Inter Bold
      fontSize: '2rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
      fontFamily: 'Inter, sans-serif',
    },
    h3: {
      fontWeight: 700, // Inter Bold
      fontSize: '1.5rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
      fontFamily: 'Inter, sans-serif',
    },
    h4: {
      fontWeight: 700, // Inter Bold
      fontSize: '1.25rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
      fontFamily: 'Inter, sans-serif',
    },
    h5: {
      fontWeight: 700, // Inter Bold
      fontSize: '1.125rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
      fontFamily: 'Inter, sans-serif',
    },
    h6: {
      fontWeight: 700, // Inter Bold
      fontSize: '1rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
      fontFamily: 'Inter, sans-serif',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      fontFamily: 'Inter, sans-serif',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      fontFamily: 'Inter, sans-serif',
    },
    button: {
      fontWeight: 700, // Inter Bold
      textTransform: 'none',
      letterSpacing: '0.025em',
      fontSize: '0.875rem', // 14px
      fontFamily: 'Inter, sans-serif',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 300, // Inter Light
      fontFamily: 'Inter, sans-serif',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#D32F2F', // Primary Red from Figma spec
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          height: '56px', // Figma spec height
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E0E0E0',
          width: 280,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          height: '48px', // Standard height for nav items
          '&:hover': {
            backgroundColor: '#F5F5F5',
          },
          '&.Mui-selected': {
            backgroundColor: '#D32F2F',
            color: '#FFFFFF',
            borderLeft: '3px solid #D32F2F', // Active red left-border
            '&:hover': {
              backgroundColor: '#B71C1C',
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#757575',
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 500, // Inter Medium
          fontSize: '0.875rem', // 14px
          fontFamily: 'Inter, sans-serif',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500, // Inter Medium
          fontSize: '0.875rem', // 14px
          letterSpacing: '0.01em',
          color: '#757575',
          minHeight: 64,
          padding: '12px 24px', // 24px spacing between tabs
          fontFamily: 'Inter, sans-serif',
          '&.Mui-selected': {
            color: '#D32F2F',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#D32F2F', // Red active underline
          height: '2px', // 2px red underline
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
          border: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          height: '36px', // Figma spec height
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700, // Inter Bold
          fontSize: '0.875rem', // 14px
          textTransform: 'none',
          letterSpacing: '0.025em',
        },
        contained: {
          backgroundColor: '#D32F2F',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#B71C1C',
          },
        },
        outlined: {
          borderColor: '#E0E0E0',
          color: '#212121',
          '&:hover': {
            backgroundColor: '#F5F5F5',
            borderColor: '#BDBDBD',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem', // 12px
        },
      },
    },
  },
});

const drawerWidth = 280;

// HR Menu Items
const hrMenuItems = [
  { text: 'Dashboard', page: 'dashboard' },
  { text: 'Job Descriptions', page: 'jobs' },
  { text: 'Candidates', page: 'candidates' },
  { text: 'Competency Management', page: 'competency' },
  { text: 'AI Recommendations', page: 'ai-recommendations' },
  { text: 'Analytics', page: 'analytics' },
  { text: 'Settings', page: 'settings' },
];

// Candidate Menu Items
const candidateMenuItems = [
  { text: 'My Dashboard', page: 'candidate-dashboard' },
  { text: 'Browse Jobs', page: 'browse-jobs' },
  { text: 'My Applications', page: 'my-applications' },
  { text: 'My Profile', page: 'my-profile' },
  { text: 'Notifications', page: 'notifications' },
  { text: 'Settings', page: 'settings' },
];

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const theme_use = useTheme();
  const isMobile = useMediaQuery(theme_use.breakpoints.down('md'));
  
  const { user, logout, isHR, isCandidate } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
  };

  const renderPage = () => {
    // HR Pages
    if (isHR()) {
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'jobs':
          return <JobsPage />;
        case 'candidates':
          return <CandidatesPage />;
        case 'competency':
          return <CompetencyPage />;
        case 'ai-recommendations':
          return <AIRecommendationEngine />;
        case 'analytics':
          return <AnalyticsPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <Dashboard />;
      }
    }
    
    // Candidate Pages
    if (isCandidate()) {
      switch (currentPage) {
        case 'candidate-dashboard':
          return <CandidateDashboard />;
        case 'browse-jobs':
          return <BrowseJobsPage />;
        case 'my-applications':
          return <MyApplicationsPage />;
        case 'my-profile':
          return <MyProfilePage />;
        case 'notifications':
          return <NotificationsPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <CandidateDashboard />;
      }
    }
    
    return <Dashboard />;
  };

  const getCurrentPageTitle = () => {
    if (isHR()) {
      return hrMenuItems.find(item => item.page === currentPage)?.text || 'Dashboard';
    }
    if (isCandidate()) {
      return candidateMenuItems.find(item => item.page === currentPage)?.text || 'My Dashboard';
    }
    return 'Dashboard';
  };

  const drawer = isHR() ? (
    <HRNavigation currentPage={currentPage} onPageChange={handlePageChange} />
  ) : (
    <CandidateNavigation currentPage={currentPage} onPageChange={handlePageChange} />
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme_use.zIndex.drawer + 1,
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
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 600,
              letterSpacing: '-0.025em',
              flexGrow: 1,
            }}
          >
            {getCurrentPageTitle()}
          </Typography>
          
          {/* User Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#F9FAFB',
        }}
      >
        <Toolbar />
        <Box sx={{ width: '100%' }}>
          {renderPage()}
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  console.log('App component rendering...');
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppWithAuth = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log('AppWithAuth: loading =', loading);
  console.log('AppWithAuth: isAuthenticated =', isAuthenticated());

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('AppWithAuth: Showing loading spinner');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#F9FAFB',
        }}
      >
        <div>Loading...</div>
      </Box>
    );
  }

  console.log('AppWithAuth: Not loading, checking authentication');
  return isAuthenticated() ? (
    <ProtectedRoute>
      <AppContent />
    </ProtectedRoute>
  ) : (
    <AuthPage />
  );
};

export default App;

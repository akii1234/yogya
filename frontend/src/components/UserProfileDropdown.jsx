import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserProfileDropdown = ({ onPageChange }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    onPageChange('profile');
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.email) {
      return user.email;
    }
    return 'User';
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: '#D32F2F',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {getUserInitials()}
        </Avatar>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {getUserDisplayName()}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: '1rem',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1,
            '& .MuiMenuItem-root': {
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8f9fa' }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            {getUserDisplayName()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        {/* Profile Menu Item */}
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">My Profile</Typography>
          </ListItemText>
        </MenuItem>

        <Divider />

        {/* Logout Menu Item */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Logout</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfileDropdown; 
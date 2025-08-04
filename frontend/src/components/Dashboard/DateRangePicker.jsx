import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ClickAwayListener,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';

const DateRangePicker = ({ value, onChange, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);

  const defaultOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const menuOptions = options.length > 0 ? options : defaultOptions;
  const selectedOption = menuOptions.find(option => option.value === value) || menuOptions[0];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Box sx={{ position: 'relative' }} ref={anchorRef}>
      {/* Custom Select Button */}
      <Box
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 200,
          height: 48,
          padding: '0 16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          fontFamily: 'Inter, sans-serif',
          '&:hover': {
            borderColor: '#BDBDBD',
            backgroundColor: '#FAFAFA',
          },
          '&:focus-within': {
            borderColor: '#D32F2F',
            borderWidth: '2px',
            outline: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon sx={{ color: '#757575', fontSize: 20 }} />
          <Typography
            sx={{
              color: '#212121',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {selectedOption.label}
          </Typography>
        </Box>
        <ArrowDownIcon 
          sx={{ 
            color: '#757575', 
            fontSize: 20,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }} 
        />
      </Box>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              borderRadius: '8px',
              boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid #E0E0E0',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            <List sx={{ padding: 0 }}>
              {menuOptions.map((option) => (
                <ListItem
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  sx={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: option.value === value ? '#D32F2F' : 'transparent',
                    '&:hover': {
                      backgroundColor: option.value === value ? '#B71C1C' : '#F5F5F5',
                    },
                    '&:first-of-type': {
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    },
                    '&:last-of-type': {
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                    },
                  }}
                >
                  <ListItemText
                    primary={option.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: option.value === value ? '#FFFFFF' : '#212121',
                        fontSize: '14px',
                        fontWeight: option.value === value ? 600 : 500,
                        fontFamily: 'Inter, sans-serif',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default DateRangePicker; 
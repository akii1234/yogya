import React from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';

const MetricCard = ({ 
  icon, 
  value, 
  label, 
  trend, 
  trendValue, 
  color = '#D32F2F', 
  bgTint = '#FFFFFF',
  onClick 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpIcon sx={{ fontSize: 16, color: '#2E7D32' }} />;
    if (trend === 'down') return <ArrowDownIcon sx={{ fontSize: 16, color: '#C62828' }} />;
    return <RemoveIcon sx={{ fontSize: 16, color: '#757575' }} />;
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        width: '100%',
        height: '130px',
        backgroundColor: bgTint,
        borderRadius: '12px',
        boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
        border: 'none',
        padding: '18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': {
          transform: onClick ? 'scale(1.02)' : 'none',
          boxShadow: onClick ? '0px 8px 20px rgba(0,0,0,0.15)' : '0px 2px 6px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Header with Icon and Trend */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 1.5 
      }}>
        {/* Icon Container */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}15`,
            color: color,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: `${color}25`,
            },
          }}
        >
          {icon}
        </Box>

        {/* Trend Indicator */}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon()}
            <Box
              sx={{
                backgroundColor: trend === 'up' ? '#2E7D32' : '#C62828',
                color: '#FFFFFF',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1,
                minWidth: 'fit-content',
              }}
            >
              {trendValue}
            </Box>
          </Box>
        )}
      </Box>

      {/* Content Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-end' 
      }}>
        {/* Value */}
        <Typography
          sx={{
            color: '#212121',
            fontWeight: 700,
            fontSize: '22px',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            mb: 0.5,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {value}
        </Typography>

        {/* Label */}
        <Typography
          sx={{
            color: '#212121',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '0.01em',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default MetricCard; 
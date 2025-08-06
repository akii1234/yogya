import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const TestAuth = () => {
  const [testResult, setTestResult] = useState('');
  const { register, login } = useAuth();

  const testSignup = async () => {
    try {
      setTestResult('Testing signup...');
      
      const testUser = {
        first_name: 'Test',
        last_name: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'testpass123',
        role: 'candidate'
      };
      
      const result = await register(testUser);
      
      if (result.success) {
        setTestResult(`✅ Signup successful! User: ${testUser.email}`);
      } else {
        setTestResult(`❌ Signup failed: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      setTestResult('Testing login...');
      
      const result = await login('testuser2', 'testpass123');
      
      if (result.success) {
        setTestResult('✅ Login successful!');
      } else {
        setTestResult(`❌ Login failed: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Auth Test Page
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testSignup}
          sx={{ mr: 2 }}
        >
          Test Signup
        </Button>
        
        <Button 
          variant="contained" 
          onClick={testLogin}
        >
          Test Login
        </Button>
      </Box>
      
      {testResult && (
        <Alert severity={testResult.includes('✅') ? 'success' : 'error'}>
          {testResult}
        </Alert>
      )}
    </Box>
  );
};

export default TestAuth; 
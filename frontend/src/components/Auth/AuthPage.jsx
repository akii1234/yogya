import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import RegistrationSuccess from './RegistrationSuccess';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState(null);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);
  
  const handleRegistrationSuccess = (userData) => {
    setRegisteredUserData(userData);
    setShowRegistrationSuccess(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationSuccess(false);
    setRegisteredUserData(null);
    // User will be automatically logged in and redirected to dashboard
  };

  if (showRegistrationSuccess) {
    return (
      <RegistrationSuccess 
        userData={registeredUserData} 
        onComplete={handleRegistrationComplete} 
      />
    );
  }

  return (
    <>
      {isLogin ? (
        <LoginForm onSwitchToRegister={switchToRegister} />
      ) : (
        <RegisterForm 
          onSwitchToLogin={switchToLogin} 
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
    </>
  );
};

export default AuthPage; 
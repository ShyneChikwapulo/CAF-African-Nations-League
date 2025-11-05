import React, { useState } from 'react';
import Login from '../components/Login';
import TeamRegistration from './TeamRegistration';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = () => {
    window.location.href = '/';
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isLogin ? (
        <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
      ) : (
        <TeamRegistration onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
};

export default Auth;
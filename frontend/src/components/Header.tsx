import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  currentUser: any;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src='/images/Logo.png' alt="African Nations League" className="w-12 h-12" />
            <span className="text-2xl font-bold">African Nations League</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link to="/tournament" className="hover:text-blue-200 transition-colors">
              Tournament
            </Link>
            
            {currentUser ? (
              <>
                {currentUser.role === 'representative' && (
                  <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
                    Team Dashboard
                  </Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="hover:text-blue-200 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    {currentUser.email} ({currentUser.role})
                  </span>
                  <button
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/auth" className="hover:text-blue-200 transition-colors">
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
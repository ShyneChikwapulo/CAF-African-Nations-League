// frontend/src/App.tsx - Updated with authentication
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Tournament from './pages/Tournament';
import TeamRegistration from './pages/TeamRegistration';
import AdminPanel from './pages/AdminPanel';
import MatchDetails from './pages/MatchDetails';
import TeamDashboard from './pages/TeamDashboard';
import Auth from './pages/Auth';
import { authAPI } from './services/api';
import WinnerScreen from './pages/WinnerScreen';


function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setCurrentUser(response.data);
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (

      <Router>
        <div className="min-h-screen bg-gray-100">
          <Header currentUser={currentUser} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} />} />
            <Route path="/tournament" element={<Tournament />} />
            <Route path="/auth" element={!currentUser ? <Auth /> : <Navigate to="/" />} />
            <Route 
              path="/register" 
              element={
                !currentUser ? <TeamRegistration /> : <Navigate to="/" />
              } 
            />
            <Route 
              path="/admin" 
              element={
                currentUser?.role === 'admin' ? <AdminPanel /> : <Navigate to="/auth" />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                currentUser?.role === 'representative' ? <TeamDashboard /> : <Navigate to="/auth" />
              } 
            />
            <Route path="/match/:id" element={<MatchDetails />} />
            <Route path="/winner" element={<WinnerScreen />} />
          </Routes>
        </div>
      </Router>

  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';
import FormPage from './Pages/FormPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isAuthenticated) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // ONLY remove user data, NOT operations!
    localStorage.removeItem('user');
    // DO NOT remove operations!
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          <nav className="navbar">
            <div className="nav-container">
              <div className="nav-left">
                <h2> Gestion de Caisse</h2>
              </div>
              <div className="nav-right">
                <div className="user-info">
                  <span className="user-avatar"></span>
                  <span className="user-name">
                    {JSON.parse(localStorage.getItem('user'))?.nom_complet || 'Utilisateur'}
                  </span>
                </div>
                <button 
                  className="btn btn-secondary logout-btn"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </nav>
        )}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" /> : 
              <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <HomePage /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/operation/:type" 
            element={
              isAuthenticated ? 
              <FormPage /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated ? "/" : "/login"} />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
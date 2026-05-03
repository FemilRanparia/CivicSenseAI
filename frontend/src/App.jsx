import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import axios from 'axios';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [language, setLanguage] = useState(userProfile?.language || 'english');

  const handleLogin = (newToken, profile) => {
    setToken(newToken);
    setUserProfile(profile);
    setLanguage(profile.language || 'english');
    localStorage.setItem('token', newToken);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setToken(null);
    setUserProfile(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    // Clear legacy local storage too
    localStorage.removeItem(`timeline_${userProfile?.age}_${userProfile?.state}`);
  };

  return (
    <Router>
      <div className="app-container">
        <header className="navbar">
          <div className="logo">
            <div className="logo-icon">
              <ShieldCheck size={24} />
            </div>
            CivicSense AI
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(15, 15, 15, 0.8)', borderRadius: '20px', padding: '4px', border: '1px solid var(--border-color)', gap: '4px' }}>
              <button 
                onClick={() => setLanguage('english')}
                style={{ 
                  padding: '0.4rem 1rem', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s',
                  background: language === 'english' ? 'var(--primary)' : 'transparent',
                  color: language === 'english' ? '#fff' : 'var(--text-muted)'
                }}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('hinglish')}
                style={{ 
                  padding: '0.4rem 1rem', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s',
                  background: language === 'hinglish' ? 'var(--primary)' : 'transparent',
                  color: language === 'hinglish' ? '#fff' : 'var(--text-muted)'
                }}
              >
                Hinglish
              </button>
            </div>
            {token && (
              <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <Routes>
            <Route 
              path="/" 
              element={token ? <Navigate to="/dashboard" /> : <AuthModal onLogin={handleLogin} onClose={() => {}} />} 
            />
            <Route 
              path="/dashboard" 
              element={token ? <Dashboard userProfile={userProfile} language={language} token={token} /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)' }}>
          <p>© 2026 CivicSense AI.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

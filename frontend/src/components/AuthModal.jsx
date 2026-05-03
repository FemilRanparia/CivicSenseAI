import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserPlus, LogIn, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATES_IN_INDIA = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

function AuthModal({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    age: '',
    state: '',
    firstTimeVoter: false,
    language: 'english'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      onLogin(res.data.token, res.data.userProfile);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative' }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <ShieldCheck size={40} className="text-gradient" style={{ margin: '0 auto 1rem' }} />
          <h2 className="heading-md">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-muted">{isLogin ? 'Log in to continue your journey' : 'Sign up to save your progress'}</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="email" 
              className="form-control" 
              placeholder="Email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          {!isLogin && (
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Username" 
                required={!isLogin}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}
          <div className="input-group">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="number" className="form-control" placeholder="Age" min="18" max="120" required
                  value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
                <select 
                  className="form-control" required
                  value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  <option value="" disabled>State</option>
                  {STATES_IN_INDIA.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <input 
                  type="checkbox" id="authFirstTime"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  checked={formData.firstTimeVoter}
                  onChange={(e) => setFormData({...formData, firstTimeVoter: e.target.checked})}
                />
                <label htmlFor="authFirstTime" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  I am a first-time voter
                </label>
              </div>
            </motion.div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Sign Up</>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span className="text-muted">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'transparent', border: 'none', color: '#A5B4FC', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthModal;

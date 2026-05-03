import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Calendar, CheckCircle } from 'lucide-react';

const STATES_IN_INDIA = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

function ProfileForm({ onSave }) {
  const [formData, setFormData] = useState({
    age: '',
    state: '',
    firstTimeVoter: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.age && formData.state) {
      onSave(formData);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel" 
      style={{ maxWidth: '500px', margin: '4rem auto', padding: '2.5rem' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="heading-md text-gradient">Welcome to CivicSense AI</h2>
        <p className="text-muted">Let's personalize your voting journey. Tell us a bit about yourself.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">
            <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/>
            Your Age
          </label>
          <input 
            type="number" 
            className="form-control" 
            placeholder="e.g. 21" 
            min="18"
            max="120"
            required
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
          />
        </div>

        <div className="input-group">
          <label className="input-label">
            <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }}/>
            Your State / UT
          </label>
          <select 
            className="form-control" 
            required
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
          >
            <option value="" disabled>Select your state</option>
            {STATES_IN_INDIA.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <input 
            type="checkbox" 
            id="firstTimeVoter"
            style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
            checked={formData.firstTimeVoter}
            onChange={(e) => setFormData({...formData, firstTimeVoter: e.target.checked})}
          />
          <label htmlFor="firstTimeVoter" style={{ cursor: 'pointer', fontWeight: 500 }}>
            I am a first-time voter
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
          Generate My Guide
          <CheckCircle size={18} />
        </button>
      </form>
    </motion.div>
  );
}

export default ProfileForm;

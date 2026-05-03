import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ExternalLink } from 'lucide-react';

function JourneyTimeline({ timeline, onToggleStep }) {
  if (!timeline || timeline.length === 0) return null;

  // Calculate progress (mock implementation, usually comes from backend)
  const completedSteps = timeline.filter(t => t.status === 'completed').length;
  const progressPercent = timeline.length > 0 ? (completedSteps / timeline.length) * 100 : 0;

  return (
    <div>
      <div className="progress-container" style={{
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 10px 15px -15px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
          <span className="text-muted">Journey Progress</span>
          <span className="text-gradient" style={{ fontWeight: 'bold' }}>{Math.round(progressPercent)}%</span>
        </div>
        <div className="progress-bar-bg" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: '2rem' }}>
        {/* Timeline line */}
        <div style={{ 
          position: 'absolute', top: '10px', bottom: '10px', left: '15px', 
          width: '2px', background: 'var(--border-color)', zIndex: 0 
        }}></div>

        {timeline.map((step, idx) => (
          <motion.div 
            key={idx}
            className={`stagger-${(idx % 3) + 1} animate-fade-in`}
            style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 1, cursor: 'pointer' }}
            onClick={() => onToggleStep && onToggleStep(idx)}
          >
            <div style={{ 
              background: 'var(--bg-card)', borderRadius: '50%', padding: '4px',
              color: step.status === 'completed' ? 'var(--secondary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'flex-start', zIndex: 2,
              transition: 'all 0.3s'
            }}>
              {step.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
            
            <div style={{ 
              background: step.status === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)', 
              border: step.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border)',
              borderRadius: '12px', padding: '1.25rem', width: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.borderColor = step.status === 'completed' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(79, 70, 229, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = step.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)';
            }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                {step.title}
              </h4>
              <p className="text-muted" style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {step.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#A5B4FC' }}>
                  <Clock size={14} />
                  <span>{step.date}</span>
                </div>
                {step.link && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(step.link, '_blank');
                    }}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                    }}
                  >
                    Open Link <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default JourneyTimeline;

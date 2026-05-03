import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ChatAssistant from './ChatAssistant';
import JourneyTimeline from './JourneyTimeline';
import { Compass, MessageSquare, ArrowDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Dashboard({ userProfile, language, token }) {
  const [timeline, setTimeline] = useState(userProfile.timeline && userProfile.timeline.length > 0 ? userProfile.timeline : []);
  const [loading, setLoading] = useState(false);
  const timelineContainerRef = React.useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const handleScroll = () => {
    if (!timelineContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = timelineContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 20) {
      setShowScrollDown(true);
    } else {
      setShowScrollDown(false);
    }
  };

  useEffect(() => {
    setTimeout(handleScroll, 200);
  }, [timeline]);

  const scrollToBottom = () => {
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollTo({
        top: timelineContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchJourney = async () => {
      if (timeline.length > 0) return; // Already loaded from profile

      // Check if we have a saved timeline in localStorage for this user
      const savedTimelineStr = localStorage.getItem(`timeline_${userProfile.age}_${userProfile.state}`);
      if (savedTimelineStr) {
        setTimeline(JSON.parse(savedTimelineStr));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.post(`${API_URL}/journey`, {
          ...userProfile,
          language
        });
        setTimeline(res.data.timeline || []);
        localStorage.setItem(`timeline_${userProfile.age}_${userProfile.state}`, JSON.stringify(res.data.timeline || []));
      } catch (error) {
        console.error("Error fetching journey:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJourney();
  }, [userProfile, language]);

  const handleToggleStep = async (index) => {
    const updatedTimeline = [...timeline];
    const isCurrentlyCompleted = updatedTimeline[index].status === 'completed';
    
    if (!isCurrentlyCompleted) {
      // Enforce sequential: cannot complete if previous is pending
      if (index > 0 && updatedTimeline[index - 1].status !== 'completed') {
        alert("Please complete the previous steps in the timeline first.");
        return;
      }
      updatedTimeline[index].status = 'completed';
    } else {
      // Enforce sequential: cannot un-complete if next is completed
      if (index < updatedTimeline.length - 1 && updatedTimeline[index + 1].status === 'completed') {
        alert("Please unmark the subsequent completed steps first.");
        return;
      }
      updatedTimeline[index].status = 'pending';
    }
    setTimeline(updatedTimeline);
    localStorage.setItem(`timeline_${userProfile.age}_${userProfile.state}`, JSON.stringify(updatedTimeline));
    
    // Sync this to the backend user profile
    try {
      await axios.post(`${API_URL}/user/sync`, {
        token,
        timeline: updatedTimeline
      });
    } catch (e) {
      console.error("Failed to sync timeline to backend");
    }
  };

  return (
    <div className="grid-layout animate-fade-in">
      {/* Left Column - Journey Timeline */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '600px', position: 'relative' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', 
          marginBottom: '2rem', paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 10px 15px -15px rgba(0,0,0,0.5)'
        }}>
          <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
            <Compass size={20} />
          </div>
          <h2 className="heading-md" style={{ margin: 0 }}>Welcome {userProfile.username}! Your Election Journey</h2>
        </div>
        
        {loading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
              <Compass size={32} />
            </motion.div>
            <p>Generating your personalized timeline...</p>
          </div>
        ) : (
          <div 
            ref={timelineContainerRef} 
            onScroll={handleScroll} 
            style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}
            className="custom-scrollbar"
          >
            <JourneyTimeline timeline={timeline} onToggleStep={handleToggleStep} />
          </div>
        )}

        {/* Floating Scroll Arrow for Timeline */}
        {showScrollDown && !loading && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 15, 15, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              color: '#A5B4FC',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
            whileHover={{ backgroundColor: 'rgba(25, 25, 25, 0.8)' }}
          >
            <ArrowDown size={18} />
          </motion.button>
        )}
      </div>

      {/* Right Column - Chat Assistant */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '600px' }}>
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--glass-border)', 
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 4px 15px -5px rgba(0,0,0,0.3)',
          zIndex: 10
        }}>
          <MessageSquare size={24} className="text-gradient" />
          <h3 className="heading-md" style={{ margin: 0, fontSize: '1.25rem' }}>AI Guide</h3>
        </div>
        <ChatAssistant userProfile={userProfile} language={language} apiUrl={API_URL} token={token} />
      </div>
    </div>
  );
}

export default Dashboard;

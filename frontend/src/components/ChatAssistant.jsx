import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot, HelpCircle, Trash2, ArrowDown } from 'lucide-react';
import axios from 'axios';
import Markdown from 'react-markdown';
import DOMPurify from 'dompurify';

function ChatAssistant({ userProfile, language, apiUrl, token }) {
  const defaultMessage = language === 'hinglish' 
    ? `Namaste! Main CivicSense AI hoon. Aapki age ${userProfile.age} hai aur aap ${userProfile.state} se hain. Bataiye main aapki kya madad kar sakta hoon?`
    : `Hello! I'm CivicSense AI. I see you are ${userProfile.age} years old from ${userProfile.state}. How can I help you today?`;

  const defaultSession = {
    title: 'New Chat',
    messages: [{ role: 'assistant', content: defaultMessage }]
  };

  const [chatSessions, setChatSessions] = useState(
    userProfile.chatSessions && userProfile.chatSessions.length > 0 
      ? userProfile.chatSessions 
      : [defaultSession]
  );
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  
  const currentMessages = chatSessions[currentSessionIndex]?.messages || [];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "How do I register to vote?",
    "What documents do I need?",
    "Where is my polling booth?"
  ]);
  const messagesContainerRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 20) {
      setShowScrollDown(true);
    } else {
      setShowScrollDown(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Check initial scroll state after rendering
    setTimeout(handleScroll, 100);
  }, [currentMessages, loading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = text;
    
    // Instantly show user message
    const optimisticSessions = [...chatSessions];
    optimisticSessions[currentSessionIndex] = {
      ...optimisticSessions[currentSessionIndex],
      messages: [...currentMessages, { role: 'user', content: userMsg }]
    };
    setChatSessions(optimisticSessions);
    
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      const res = await axios.post(`${apiUrl}/chat`, {
        message: userMsg,
        language,
        userProfile
      });
      
      const newMessages = [...currentMessages, { role: 'user', content: userMsg }, { role: 'assistant', content: res.data.response }];
      
      const updatedSessions = [...chatSessions];
      updatedSessions[currentSessionIndex] = {
        ...updatedSessions[currentSessionIndex],
        messages: newMessages,
        // Auto-generate title from first user message if it's "New Chat"
        title: updatedSessions[currentSessionIndex].title === 'New Chat' ? userMsg.substring(0, 20) + '...' : updatedSessions[currentSessionIndex].title
      };
      
      setChatSessions(updatedSessions);
      
      // Sync chat sessions
      axios.post(`${apiUrl}/user/sync`, {
        token,
        chatSessions: updatedSessions
      }).catch(e => console.error("Failed to sync chat history"));

      if (res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorSessions = [...chatSessions];
      errorSessions[currentSessionIndex] = {
        ...errorSessions[currentSessionIndex],
        messages: [...errorSessions[currentSessionIndex].messages, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]
      };
      setChatSessions(errorSessions);
      
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSession = {
      title: 'New Chat',
      messages: [{ role: 'assistant', content: defaultMessage }]
    };
    const updated = [newSession, ...chatSessions];
    setChatSessions(updated);
    setCurrentSessionIndex(0);
    
    axios.post(`${apiUrl}/user/sync`, {
      token,
      chatSessions: updated
    }).catch(e => console.error("Failed to sync chat history"));
  };

  const handleDeleteChat = () => {
    if (chatSessions.length <= 1) {
      // If only one chat, just clear its messages
      const cleared = [{ ...chatSessions[0], messages: [{ role: 'assistant', content: defaultMessage }] }];
      setChatSessions(cleared);
      axios.post(`${apiUrl}/user/sync`, { token, chatSessions: cleared }).catch(e => console.error(e));
      return;
    }

    const updated = chatSessions.filter((_, idx) => idx !== currentSessionIndex);
    setChatSessions(updated);
    setCurrentSessionIndex(0); // reset to first chat
    axios.post(`${apiUrl}/user/sync`, { token, chatSessions: updated }).catch(e => console.error(e));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: '0 1.5rem 1.5rem 1.5rem' }}>
      {/* Chat Sessions Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '1rem', paddingBottom: '1rem', 
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 10px 10px -10px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', width: '65%' }}>
          <select 
            className="form-control" 
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
            value={currentSessionIndex}
            onChange={(e) => setCurrentSessionIndex(Number(e.target.value))}
          >
            {chatSessions.map((session, idx) => (
              <option key={idx} value={idx}>{session.title}</option>
            ))}
          </select>
          <button 
            onClick={handleDeleteChat} 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
            title="Delete current chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <button onClick={handleNewChat} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          + New Chat
        </button>
      </div>

      {/* Messages Area Wrapper */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: '1rem' }}>
        <div ref={messagesContainerRef} onScroll={handleScroll} style={{ 
          flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          background: 'linear-gradient(to bottom, rgba(5,5,5,0.8), rgba(15,15,15,0.4))',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.02)',
          boxShadow: 'inset 0 2px 15px rgba(0,0,0,0.5)'
        }}>
          {currentMessages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                display: 'flex', 
                gap: '1rem',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                flexShrink: 0
              }}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-gradient" />}
              </div>
              
              <div className={msg.role === 'assistant' ? 'markdown-content' : ''} style={{
                maxWidth: '90%',
                padding: '1.15rem',
                borderRadius: '12px',
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                border: msg.role === 'assistant' ? '1px solid var(--glass-border)' : 'none',
                lineHeight: 1.6,
                fontSize: '1rem'
              }}>
                {msg.role === 'user' ? msg.content : <Markdown>{DOMPurify.sanitize(msg.content)}</Markdown>}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                <Bot size={18} className="text-gradient" />
              </div>
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                <span className="text-muted">Typing...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Scroll Arrow */}
        {showScrollDown && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '1rem',
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

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="custom-scrollbar" style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '0.5rem', 
          marginBottom: '1rem',
          paddingBottom: '0.5rem'
        }}>
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(s)}
              style={{
                background: 'transparent', border: '1px solid var(--primary)', 
                color: '#A5B4FC', padding: '0.5rem 1rem', borderRadius: '20px',
                fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap', flexShrink: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <HelpCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ 
        display: 'flex', gap: '0.5rem', 
        background: 'rgba(20,20,20,0.5)', padding: '0.5rem', borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 -4px 10px rgba(0,0,0,0.2)'
      }}>
        <textarea 
          className="form-control custom-scrollbar" 
          placeholder={language === 'hinglish' ? "Apna sawal yahan puchiye..." : "Ask your question here..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(input);
            }
          }}
          disabled={loading}
          rows={2}
          style={{ marginBottom: 0, resize: 'none', lineHeight: '1.5' }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()} style={{ padding: '0 1.25rem', height: 'auto' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatAssistant;

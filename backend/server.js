import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateChatResponse } from './controllers/chatController.js';
import { generateJourney } from './controllers/journeyController.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

export const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' })); // Increased limit to accommodate chat history payloads

// Rate limiting setup
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // strict limit for expensive AI endpoints
  message: { error: 'Rate limit exceeded for AI services. Please wait a minute.' }
});

app.use('/api/', apiLimiter);
app.post('/api/chat', aiLimiter, generateChatResponse);
app.post('/api/journey', aiLimiter, generateJourney);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CivicSense AI API is running' });
});

// Save user profile (legacy)
app.post('/api/users', async (req, res) => {
  // Keeping this for backward compatibility
  res.json({ status: 'ok' });
});

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password, age, state, firstTimeVoter, language } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });
    
    const newUser = new User({ email, username, password, age, state, firstTimeVoter, language, chatSessions: [] });
    await newUser.save();
    res.status(201).json({ token: newUser._id, userProfile: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    
    // In a real app, generate a JWT here instead of sending the user object directly
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    res.json({ token: user._id, userProfile: user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Sync timeline and chat
app.post('/api/user/sync', async (req, res) => {
  try {
    const { token, timeline, chatSessions } = req.body;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    
    const updateData = {};
    if (timeline) updateData.timeline = timeline;
    if (chatSessions) updateData.chatSessions = chatSessions;

    await User.findByIdAndUpdate(token, updateData);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
    });
}

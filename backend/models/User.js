import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const timelineStepSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  date: String,
  link: String
});

const chatMessageSchema = new mongoose.Schema({
  role: String,
  content: String
});

const chatSessionSchema = new mongoose.Schema({
  title: { type: String, default: "New Chat" },
  messages: [chatMessageSchema],
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true }, // Hashed automatically
  age: { type: Number },
  state: { type: String },
  firstTimeVoter: { type: Boolean, default: false },
  language: { type: String, default: 'english' },
  timeline: [timelineStepSchema],
  chatSessions: [chatSessionSchema],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Check if it's a legacy plain-text password (not a bcrypt hash starting with $2)
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    const isMatch = candidatePassword === this.password;
    if (isMatch) {
      // Auto-migrate to hashed password
      this.password = candidatePassword; // This will trigger the pre-save hook and hash it
      await this.save();
    }
    return isMatch;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

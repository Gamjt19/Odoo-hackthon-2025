const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  // StackPoints and Gamification
  stackPoints: {
    type: Number,
    default: 0
  },
  reputation: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'],
    default: 'Beginner'
  },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  badges: [{
    type: String,
    default: []
  }],
  stats: {
    questionsAsked: { type: Number, default: 0 },
    answersGiven: { type: Number, default: 0 },
    acceptedAnswers: { type: Number, default: 0 },
    totalUpvotes: { type: Number, default: 0 },
    totalDownvotes: { type: Number, default: 0 },
    answerStreak: { type: Number, default: 0 },
    lastAnswerDate: { type: Date, default: null },
    totalViews: { type: Number, default: 0 }
  },
  // Anonymous posting
  anonymousPosts: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
    postedAt: { type: Date, default: Date.now }
  }],
  confidenceBoosterBadges: {
    type: Number,
    default: 0
  },
  // Preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    allowAnonymous: { type: Boolean, default: true }
  },
  // Social features
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Activity tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ stackPoints: -1 });
userSchema.index({ level: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate level based on StackPoints
userSchema.methods.calculateLevel = function() {
  const points = this.stackPoints;
  if (points >= 10000) return 'Master';
  if (points >= 5000) return 'Expert';
  if (points >= 2000) return 'Advanced';
  if (points >= 500) return 'Intermediate';
  return 'Beginner';
};

// Method to add StackPoints
userSchema.methods.addStackPoints = function(points, reason) {
  this.stackPoints += points;
  this.level = this.calculateLevel();
  
  // Check for achievements
  this.checkAchievements();
  
  return this.save();
};

// Method to check and award achievements
userSchema.methods.checkAchievements = function() {
  const achievements = [];
  
  // Answer Streak 🔥
  if (this.stats.answerStreak >= 7 && !this.achievements.find(a => a.name === 'Answer Streak 🔥')) {
    achievements.push({
      name: 'Answer Streak 🔥',
      description: 'Answered questions for 7 consecutive days',
      icon: '🔥'
    });
  }
  
  // Problem Solver 🧠
  if (this.stats.acceptedAnswers >= 10 && !this.achievements.find(a => a.name === 'Problem Solver 🧠')) {
    achievements.push({
      name: 'Problem Solver 🧠',
      description: 'Had 10 answers accepted',
      icon: '🧠'
    });
  }
  
  // First Question 📝
  if (this.stats.questionsAsked >= 1 && !this.achievements.find(a => a.name === 'First Question 📝')) {
    achievements.push({
      name: 'First Question 📝',
      description: 'Asked your first question',
      icon: '📝'
    });
  }
  
  // Helper 🆘
  if (this.stats.answersGiven >= 5 && !this.achievements.find(a => a.name === 'Helper 🆘')) {
    achievements.push({
      name: 'Helper 🆘',
      description: 'Helped 5 people with answers',
      icon: '🆘'
    });
  }
  
  // Confidence Booster 🌟
  if (this.confidenceBoosterBadges >= 1 && !this.achievements.find(a => a.name === 'Confidence Booster 🌟')) {
    achievements.push({
      name: 'Confidence Booster 🌟',
      description: 'Had an anonymous answer accepted',
      icon: '🌟'
    });
  }
  
  this.achievements.push(...achievements);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    avatar: this.avatar,
    bio: this.bio,
    stackPoints: this.stackPoints,
    level: this.level,
    achievements: this.achievements,
    stats: this.stats,
    joinDate: this.joinDate,
    lastActive: this.lastActive
  };
};

module.exports = mongoose.model('User', userSchema); 
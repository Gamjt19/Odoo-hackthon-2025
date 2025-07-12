const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -isBanned -banReason -anonymousPosts');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const questionsCount = await Question.countDocuments({ author: req.user.id });
    const answersCount = await Answer.countDocuments({ author: req.user.id });

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      stackPoints: user.stackPoints,
      reputation: user.reputation,
      level: user.level,
      role: user.role,
      joinDate: user.joinDate,
      lastActive: user.lastActive,
      preferences: user.preferences,
      badges: user.badges,
      questionsCount,
      answersCount
    };

    res.json(userData);
  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email -isBanned -banReason -anonymousPosts');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    // Get top users by StackPoints
    const topUsers = await User.find()
      .sort({ stackPoints: -1 })
      .limit(20)
      .select('username avatar level stackPoints stats badges joinDate');

    // Get top contributors (most questions asked)
    const topContributors = await User.find()
      .sort({ 'stats.questionsAsked': -1 })
      .limit(10)
      .select('username avatar level stackPoints stats badges joinDate');

    // Get top answerers (most answers given)
    const topAnswerers = await User.find()
      .sort({ 'stats.answersGiven': -1 })
      .limit(10)
      .select('username avatar level stackPoints stats badges joinDate');

    // Get recent achievers (users who gained points recently)
    const recentAchievers = await User.find()
      .sort({ lastActive: -1 })
      .limit(10)
      .select('username avatar level stackPoints stats badges joinDate');

    // Convert to public data format
    const formatUsers = (users) => users.map(user => ({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      stackPoints: user.stackPoints,
      stats: {
        questionsAsked: user.stats.questionsAsked || 0,
        answersGiven: user.stats.answersGiven || 0,
        acceptedAnswers: user.stats.acceptedAnswers || 0,
        totalViews: user.stats.totalViews || 0,
        joinDate: user.joinDate
      },
      badges: user.badges || []
    }));

    res.json({
      topUsers: formatUsers(topUsers),
      topContributors: formatUsers(topContributors),
      topAnswerers: formatUsers(topAnswerers),
      recentAchievers: formatUsers(recentAchievers)
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id/questions
// @desc    Get questions by user
// @access  Public
router.get('/:id/questions', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar level');

    const total = await Question.countDocuments({ author: req.params.id });

    res.json({
      questions: questions.map(q => q.getPublicData()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id/answers
// @desc    Get answers by user
// @access  Public
router.get('/:id/answers', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('question', 'title slug category')
      .populate('author', 'username avatar level');

    const total = await Answer.countDocuments({ author: req.params.id });

    res.json({
      answers: answers.map(a => a.getPublicData()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
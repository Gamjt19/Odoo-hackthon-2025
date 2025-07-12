const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { adminAuth, superAdminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const pendingModeration = await Question.countDocuments({ isModerated: false });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt role');

    const recentQuestions = await Question.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'username');

    res.json({
      stats: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        bannedUsers,
        pendingModeration
      },
      recentUsers,
      recentQuestions: recentQuestions.map(q => q.getPublicData())
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (banned === 'true') query.isBanned = true;
    if (banned === 'false') query.isBanned = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/unban user
// @access  Admin
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { isBanned, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent banning admins unless super admin
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only super admins can ban other admins' });
    }

    user.isBanned = isBanned;
    user.banReason = reason || null;
    await user.save();

    res.json({
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Super Admin
router.put('/users/:id/role', superAdminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/admin/questions
// @desc    Get questions for moderation
// @access  Admin
router.get('/questions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, moderated } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (moderated === 'false') query.isModerated = false;
    if (moderated === 'true') query.isModerated = true;

    const questions = await Question.find(query)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

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
    console.error('Get admin questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/admin/questions/:id/moderate
// @desc    Moderate a question
// @access  Admin
router.put('/questions/:id/moderate', adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    question.isModerated = true;
    question.moderationReason = reason;
    question.moderatedBy = req.user.id;
    question.moderatedAt = new Date();

    if (action === 'close') {
      question.status = 'closed';
    } else if (action === 'delete') {
      await Question.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Question deleted successfully' });
    }

    await question.save();

    res.json({
      message: 'Question moderated successfully',
      question: question.getPublicData()
    });
  } catch (error) {
    console.error('Moderate question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
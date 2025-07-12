const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get platform overview analytics
// @access  Admin
router.get('/overview', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User analytics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await User.countDocuments({ lastActive: { $gte: startDate } });

    // Question analytics
    const totalQuestions = await Question.countDocuments();
    const newQuestions = await Question.countDocuments({ createdAt: { $gte: startDate } });
    const answeredQuestions = await Question.countDocuments({ status: 'answered' });

    // Answer analytics
    const totalAnswers = await Answer.countDocuments();
    const newAnswers = await Answer.countDocuments({ createdAt: { $gte: startDate } });
    const acceptedAnswers = await Answer.countDocuments({ isAccepted: true });

    // Engagement analytics
    const totalUpvotes = await Question.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$upvotes' } } } }
    ]);

    const totalDownvotes = await Question.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$downvotes' } } } }
    ]);

    // Category distribution
    const categoryStats = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Level distribution
    const levelStats = await User.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      period: `${days} days`,
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        growth: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
      },
      questions: {
        total: totalQuestions,
        new: newQuestions,
        answered: answeredQuestions,
        answerRate: totalQuestions > 0 ? ((answeredQuestions / totalQuestions) * 100).toFixed(2) : 0
      },
      answers: {
        total: totalAnswers,
        new: newAnswers,
        accepted: acceptedAnswers,
        acceptanceRate: totalAnswers > 0 ? ((acceptedAnswers / totalAnswers) * 100).toFixed(2) : 0
      },
      engagement: {
        totalUpvotes: totalUpvotes[0]?.total || 0,
        totalDownvotes: totalDownvotes[0]?.total || 0,
        netVotes: (totalUpvotes[0]?.total || 0) - (totalDownvotes[0]?.total || 0)
      },
      categories: categoryStats,
      levels: levelStats
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/user/:id
// @desc    Get user analytics
// @access  Private
router.get('/user/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is requesting their own analytics or is admin
    if (userId !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // User questions
    const userQuestions = await Question.find({ author: userId });
    const answeredQuestions = userQuestions.filter(q => q.status === 'answered');

    // User answers
    const userAnswers = await Answer.find({ author: userId });
    const acceptedAnswers = userAnswers.filter(a => a.isAccepted);

    // Vote statistics
    const questionUpvotes = userQuestions.reduce((sum, q) => sum + q.upvotes.length, 0);
    const questionDownvotes = userQuestions.reduce((sum, q) => sum + q.downvotes.length, 0);
    const answerUpvotes = userAnswers.reduce((sum, a) => sum + a.upvotes.length, 0);
    const answerDownvotes = userAnswers.reduce((sum, a) => sum + a.downvotes.length, 0);

    // Activity over time
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentQuestions = await Question.countDocuments({
      author: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    const recentAnswers = await Answer.countDocuments({
      author: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      user: {
        username: user.username,
        level: user.level,
        stackPoints: user.stackPoints,
        joinDate: user.joinDate,
        lastActive: user.lastActive
      },
      stats: {
        questionsAsked: user.stats.questionsAsked,
        answersGiven: user.stats.answersGiven,
        acceptedAnswers: user.stats.acceptedAnswers,
        totalUpvotes: user.stats.totalUpvotes,
        totalDownvotes: user.stats.totalDownvotes,
        answerStreak: user.stats.answerStreak
      },
      analytics: {
        questions: {
          total: userQuestions.length,
          answered: answeredQuestions.length,
          answerRate: userQuestions.length > 0 ? ((answeredQuestions.length / userQuestions.length) * 100).toFixed(2) : 0,
          upvotes: questionUpvotes,
          downvotes: questionDownvotes,
          netVotes: questionUpvotes - questionDownvotes
        },
        answers: {
          total: userAnswers.length,
          accepted: acceptedAnswers.length,
          acceptanceRate: userAnswers.length > 0 ? ((acceptedAnswers.length / userAnswers.length) * 100).toFixed(2) : 0,
          upvotes: answerUpvotes,
          downvotes: answerDownvotes,
          netVotes: answerUpvotes - answerDownvotes
        },
        recentActivity: {
          questionsLast30Days: recentQuestions,
          answersLast30Days: recentAnswers
        }
      },
      achievements: user.achievements
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get platform trends
// @access  Admin
router.get('/trends', adminAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily user registrations
    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Daily questions
    const dailyQuestions = await Question.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Daily answers
    const dailyAnswers = await Answer.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Top performing questions
    const topQuestions = await Question.find()
      .sort({ upvotes: -1, views: -1 })
      .limit(10)
      .populate('author', 'username')
      .select('title upvotes views createdAt');

    // Top performing users
    const topUsers = await User.find()
      .sort({ stackPoints: -1 })
      .limit(10)
      .select('username level stackPoints stats');

    res.json({
      period: `${days} days`,
      trends: {
        registrations: dailyRegistrations,
        questions: dailyQuestions,
        answers: dailyAnswers
      },
      topPerformers: {
        questions: topQuestions.map(q => q.getPublicData()),
        users: topUsers.map(u => u.getPublicProfile())
      }
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
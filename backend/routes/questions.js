const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      tags,
      search,
      sort = 'newest',
      featured
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'most_voted':
        sortObj = { upvotes: -1 };
        break;
      case 'most_viewed':
        sortObj = { views: -1 };
        break;
      case 'most_answered':
        sortObj = { answers: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar level stackPoints')
      .populate('acceptedAnswer', 'content author');

    const total = await Question.countDocuments(query);

    res.json({
      questions: questions.map(q => q.getPublicData()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      total
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/questions/trending
// @desc    Get trending questions
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const questions = await Question.getTrending(parseInt(limit));
    
    res.json({
      questions: questions.map(q => q.getPublicData())
    });
  } catch (error) {
    console.error('Get trending questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar level stackPoints bio')
      .populate('acceptedAnswer')
      .populate('comments.author', 'username avatar level stackPoints')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username avatar level stackPoints'
        }
      });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Add view if user is authenticated
    if (req.user) {
      await question.addView();
    }

    res.json({
      question: question.getPublicData(),
      answers: question.answers.map(a => a.getPublicData())
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', auth, [
  body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Content must be between 20 and 10000 characters'),
  body('category')
    .isIn(['programming', 'design', 'business', 'marketing', 'general', 'education', 'technology', 'health', 'finance', 'lifestyle'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .isLength({ min: 2, max: 20 })
    .withMessage('Each tag must be between 2 and 20 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags = [], isAnonymous = false, priority = 'medium', images = [], attachments = [] } = req.body;

    // Check if user allows anonymous posting
    if (isAnonymous && !req.user.preferences.allowAnonymous) {
      return res.status(400).json({ error: 'Anonymous posting is disabled in your preferences' });
    }

    const question = new Question({
      title,
      content,
      category,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      author: req.user.id,
      isAnonymous,
      priority,
      images,
      attachments
    });

    await question.save();

    // Add to user's anonymous posts if anonymous
    if (isAnonymous) {
      req.user.anonymousPosts.push({ questionId: question._id });
      await req.user.save();
    }

    // Award StackPoints for asking a question
    await req.user.addStackPoints(5, 'Asked a question');

    // Update user stats
    req.user.stats.questionsAsked += 1;
    await req.user.save();

    // Populate author info for response
    await question.populate('author', 'username avatar level stackPoints');

    res.status(201).json({
      message: 'Question created successfully',
      question: question.getPublicData()
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 20, max: 10000 })
    .withMessage('Content must be between 20 and 10000 characters'),
  body('category')
    .optional()
    .isIn(['programming', 'design', 'business', 'marketing', 'general', 'education', 'technology', 'health', 'finance', 'lifestyle'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user is the author or admin/moderator
    if (question.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Not authorized to edit this question' });
    }

    const { title, content, category, tags, priority } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags.map(tag => tag.toLowerCase().trim());
    if (priority) updateData.priority = priority;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar level stackPoints');

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion.getPublicData()
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user is the author or admin/moderator
    if (question.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: req.params.id });

    // Remove from user's anonymous posts if anonymous
    if (question.isAnonymous) {
      req.user.anonymousPosts = req.user.anonymousPosts.filter(
        post => post.questionId.toString() !== req.params.id
      );
      await req.user.save();
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/questions/:id/answers
// @desc    Create an answer for a question
// @access  Private
router.post('/:id/answers', auth, [
  body('content')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean')
], async (req, res) => {
  console.log('Answer route hit:', req.params.id, req.body); // Add this debug line
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, isAnonymous = false } = req.body;
    const questionId = req.params.id;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user allows anonymous posting
    if (isAnonymous && !req.user.preferences.allowAnonymous) {
      return res.status(400).json({ error: 'Anonymous posting is disabled in your preferences' });
    }

    const answer = new Answer({
      content,
      question: questionId,
      author: req.user.id,
      isAnonymous
    });

    await answer.save();

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Add to user's anonymous posts if anonymous
    if (isAnonymous) {
      req.user.anonymousPosts.push({ answerId: answer._id });
      await req.user.save();
    }

    // Award StackPoints for answering
    await req.user.addStackPoints(10, 'Answered a question');

    // Update user stats
    req.user.stats.answersGiven += 1;
    req.user.stats.lastAnswerDate = new Date();
    await req.user.save();

    // Populate author info for response
    await answer.populate('author', 'username avatar level stackPoints');

    res.status(201).json({
      message: 'Answer created successfully',
      answer: answer.getPublicData()
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/questions/:id/vote
// @desc    Vote on a question
// @access  Private
router.post('/:id/vote', auth, [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be upvote or downvote')
], async (req, res) => {
  console.log('Question vote route hit:', req.params.id, req.body);
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      console.log('Question not found:', req.params.id);
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user is voting on their own question
    if (question.author.toString() === req.user.id) {
      console.log('User trying to vote on their own question');
      return res.status(400).json({ error: 'Cannot vote on your own question' });
    }

    const { voteType } = req.body;
    console.log('Voting on question:', voteType, 'by user:', req.user.id);
    await question.toggleVote(req.user.id, voteType);

    // Award points to question author if upvoted
    if (voteType === 'upvote' && !question.upvotes.find(v => v.user.toString() === req.user.id)) {
      const author = await User.findById(question.author);
      if (author) {
        await author.addStackPoints(2, 'Question upvoted');
      }
    }

    console.log('Vote successful, returning updated question');
    res.json({
      message: 'Vote recorded successfully',
      question: question.getPublicData()
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/questions/:id/accept-answer/:answerId
// @desc    Accept an answer
// @access  Private
router.post('/:id/accept-answer/:answerId', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user is the question author
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the question author can accept answers' });
    }

    const answer = await Answer.findById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if answer belongs to this question
    if (answer.question.toString() !== req.params.id) {
      return res.status(400).json({ error: 'Answer does not belong to this question' });
    }

    // Accept the answer
    await answer.accept(req.user.id);
    await question.acceptAnswer(answer._id);

    // Award points to answer author
    const answerAuthor = await User.findById(answer.author);
    if (answerAuthor) {
      await answerAuthor.addStackPoints(15, 'Answer accepted');
      answerAuthor.stats.acceptedAnswers += 1;
      await answerAuthor.save();
    }

    // Create notification for answer author
    await Notification.createAnswerAcceptedNotification(
      answer._id,
      question._id,
      answer.author
    );

    res.json({
      message: 'Answer accepted successfully',
      question: question.getPublicData()
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/questions/:id/comment
// @desc    Add comment to question
// @access  Private
router.post('/:id/comment', auth, [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const { content } = req.body;
    await question.addComment(req.user.id, content);

    res.json({
      message: 'Comment added successfully',
      question: question.getPublicData()
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/questions/:id/comment/:commentId
// @desc    Remove comment from question
// @access  Private
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const comment = question.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author or admin/moderator
    if (comment.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await question.removeComment(req.params.commentId);

    res.json({
      message: 'Comment removed successfully',
      question: question.getPublicData()
    });
  } catch (error) {
    console.error('Remove comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/questions/search
// @desc    Search questions
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, category, status, tags, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filters.tags = tagArray;
    }

    const skip = (page - 1) * limit;
    const questions = await Question.search(q, filters)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments({
      $text: { $search: q },
      ...filters
    });

    res.json({
      questions: questions.map(q => q.getPublicData()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      total
    });
  } catch (error) {
    console.error('Search questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
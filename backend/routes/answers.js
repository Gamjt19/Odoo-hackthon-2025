const express = require('express');
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/answers
// @desc    Create a new answer
// @access  Private
router.post('/', auth, [
  body('content')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId, isAnonymous = false, images = [], attachments = [], codeBlocks = [] } = req.body;

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
      isAnonymous,
      images,
      attachments,
      codeBlocks
    });

    await answer.save();

    // Add answer to question
    await question.addAnswer(answer._id);

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
    
    // Update answer streak
    const lastAnswer = req.user.stats.lastAnswerDate;
    const today = new Date();
    const diffTime = Math.abs(today - lastAnswer);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      req.user.stats.answerStreak += 1;
    } else if (diffDays > 1) {
      req.user.stats.answerStreak = 1;
    }
    
    await req.user.save();

    // Create notification for question author
    if (!question.isAnonymous) {
      await Notification.createQuestionAnsweredNotification(
        question._id,
        answer._id,
        question.author,
        req.user.id
      );
    }

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

// @route   PUT /api/answers/:id
// @desc    Update an answer
// @access  Private
router.put('/:id', auth, [
  body('content')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user is the author or admin/moderator
    if (answer.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Not authorized to edit this answer' });
    }

    const { content, images, attachments, codeBlocks } = req.body;
    const updateData = {};

    if (content) updateData.content = content;
    if (images) updateData.images = images;
    if (attachments) updateData.attachments = attachments;
    if (codeBlocks) updateData.codeBlocks = codeBlocks;

    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar level stackPoints');

    res.json({
      message: 'Answer updated successfully',
      answer: updatedAnswer.getPublicData()
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete an answer
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user is the author or admin/moderator
    if (answer.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Not authorized to delete this answer' });
    }

    // Remove from question's answers array
    const question = await Question.findById(answer.question);
    if (question) {
      question.answers = question.answers.filter(a => a.toString() !== req.params.id);
      if (question.acceptedAnswer && question.acceptedAnswer.toString() === req.params.id) {
        question.acceptedAnswer = null;
        question.status = 'open';
      }
      await question.save();
    }

    // Remove from user's anonymous posts if anonymous
    if (answer.isAnonymous) {
      req.user.anonymousPosts = req.user.anonymousPosts.filter(
        post => post.answerId.toString() !== req.params.id
      );
      await req.user.save();
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/answers/:id/vote
// @desc    Vote on an answer
// @access  Private
router.post('/:id/vote', auth, [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be upvote or downvote')
], async (req, res) => {
  console.log('Answer vote route hit:', req.params.id, req.body);
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      console.log('Answer not found:', req.params.id);
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user is voting on their own answer
    if (answer.author.toString() === req.user.id) {
      console.log('User trying to vote on their own answer');
      return res.status(400).json({ error: 'Cannot vote on your own answer' });
    }

    const { voteType } = req.body;
    console.log('Voting on answer:', voteType, 'by user:', req.user.id);
    await answer.toggleVote(req.user.id, voteType);

    // Award points to answer author if upvoted
    if (voteType === 'upvote' && !answer.upvotes.find(v => v.user.toString() === req.user.id)) {
      const author = await User.findById(answer.author);
      if (author) {
        await author.addStackPoints(5, 'Answer upvoted');
      }
    }

    console.log('Vote successful, returning updated answer');
    res.json({
      message: 'Vote recorded successfully',
      answer: answer.getPublicData()
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/answers/:id/comment
// @desc    Add comment to answer
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

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const { content } = req.body;
    await answer.addComment(req.user.id, content);

    res.json({
      message: 'Comment added successfully',
      answer: answer.getPublicData()
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/answers/:id/comment/:commentId
// @desc    Remove comment from answer
// @access  Private
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const comment = answer.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author or admin/moderator
    if (comment.author.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await answer.removeComment(req.params.commentId);

    res.json({
      message: 'Comment removed successfully',
      answer: answer.getPublicData()
    });
  } catch (error) {
    console.error('Remove comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/answers/:id/helpful
// @desc    Mark answer as helpful
// @access  Private
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    await answer.markHelpful();

    res.json({
      message: 'Answer marked as helpful',
      answer: answer.getPublicData()
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create notification for when someone answers a question
  static async createAnswerNotification(questionId, answerId, answerAuthorId, questionAuthorId) {
    try {
      if (answerAuthorId.toString() === questionAuthorId.toString()) {
        return; // Don't notify if user answers their own question
      }

      const answerAuthor = await User.findById(answerAuthorId).select('username avatar');
      
      await Notification.create({
        recipient: questionAuthorId,
        sender: answerAuthorId,
        type: 'question_answered',
        title: 'New Answer',
        message: `${answerAuthor.username} answered your question`,
        data: {
          questionId,
          answerId
        }
      });
    } catch (error) {
      console.error('Error creating answer notification:', error);
    }
  }

  // Create notification for when someone comments on a question
  static async createQuestionCommentNotification(questionId, commentId, commentAuthorId, questionAuthorId) {
    try {
      if (commentAuthorId.toString() === questionAuthorId.toString()) {
        return; // Don't notify if user comments on their own question
      }

      const commentAuthor = await User.findById(commentAuthorId).select('username avatar');
      
      await Notification.create({
        recipient: questionAuthorId,
        sender: commentAuthorId,
        type: 'comment_added',
        title: 'New Comment',
        message: `${commentAuthor.username} commented on your question`,
        data: {
          questionId,
          commentId
        }
      });
    } catch (error) {
      console.error('Error creating question comment notification:', error);
    }
  }

  // Create notification for when someone comments on an answer
  static async createAnswerCommentNotification(questionId, answerId, commentId, commentAuthorId, answerAuthorId) {
    try {
      if (commentAuthorId.toString() === answerAuthorId.toString()) {
        return; // Don't notify if user comments on their own answer
      }

      const commentAuthor = await User.findById(commentAuthorId).select('username avatar');
      
      await Notification.create({
        recipient: answerAuthorId,
        sender: commentAuthorId,
        type: 'comment_added',
        title: 'New Comment',
        message: `${commentAuthor.username} commented on your answer`,
        data: {
          questionId,
          answerId,
          commentId
        }
      });
    } catch (error) {
      console.error('Error creating answer comment notification:', error);
    }
  }

  // Create notification for when someone upvotes a question
  static async createQuestionUpvoteNotification(questionId, voterId, questionAuthorId) {
    try {
      if (voterId.toString() === questionAuthorId.toString()) {
        return; // Don't notify if user upvotes their own question
      }

      const voter = await User.findById(voterId).select('username avatar');
      
      await Notification.create({
        recipient: questionAuthorId,
        sender: voterId,
        type: 'question_upvoted',
        title: 'Question Upvoted',
        message: `${voter.username} upvoted your question`,
        data: {
          questionId
        }
      });
    } catch (error) {
      console.error('Error creating question upvote notification:', error);
    }
  }

  // Create notification for when someone upvotes an answer
  static async createAnswerUpvoteNotification(questionId, answerId, voterId, answerAuthorId) {
    try {
      if (voterId.toString() === answerAuthorId.toString()) {
        return; // Don't notify if user upvotes their own answer
      }

      const voter = await User.findById(voterId).select('username avatar');
      
      await Notification.create({
        recipient: answerAuthorId,
        sender: voterId,
        type: 'answer_upvoted',
        title: 'Answer Upvoted',
        message: `${voter.username} upvoted your answer`,
        data: {
          questionId,
          answerId
        }
      });
    } catch (error) {
      console.error('Error creating answer upvote notification:', error);
    }
  }

  // Create notification for when an answer is accepted
  static async createAnswerAcceptedNotification(questionId, answerId, answerAuthorId) {
    try {
      await Notification.create({
        recipient: answerAuthorId,
        type: 'answer_accepted',
        title: 'Answer Accepted! 🎉',
        message: 'Your answer was marked as the best answer!',
        data: {
          questionId,
          answerId
        },
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating answer accepted notification:', error);
    }
  }

  // Create notification for mentions (@username)
  static async createMentionNotification(questionId, answerId, commentId, mentionerId, mentionedUsername) {
    try {
      const mentionedUser = await User.findOne({ username: mentionedUsername });
      if (!mentionedUser || mentionedUser._id.toString() === mentionerId.toString()) {
        return; // Don't notify if user mentions themselves or user doesn't exist
      }

      const mentioner = await User.findById(mentionerId).select('username avatar');
      
      await Notification.create({
        recipient: mentionedUser._id,
        sender: mentionerId,
        type: 'mention',
        title: 'You were mentioned',
        message: `${mentioner.username} mentioned you in a ${answerId ? 'comment' : 'question'}`,
        data: {
          questionId,
          answerId,
          commentId
        }
      });
    } catch (error) {
      console.error('Error creating mention notification:', error);
    }
  }

  // Create achievement notification
  static async createAchievementNotification(userId, achievement) {
    try {
      await Notification.create({
        recipient: userId,
        type: 'achievement_earned',
        title: 'Achievement Unlocked! 🎉',
        message: `You've earned the "${achievement.name}" achievement!`,
        data: {
          achievement: achievement.name
        },
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating achievement notification:', error);
    }
  }

  // Create level up notification
  static async createLevelUpNotification(userId, newLevel, points) {
    try {
      await Notification.create({
        recipient: userId,
        type: 'level_up',
        title: 'Level Up! ⬆️',
        message: `Congratulations! You've reached ${newLevel} level with ${points} points!`,
        data: {
          level: newLevel,
          points
        },
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating level up notification:', error);
    }
  }

  // Extract mentions from text content
  static extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return [...new Set(mentions)]; // Remove duplicates
  }
}

module.exports = NotificationService; 
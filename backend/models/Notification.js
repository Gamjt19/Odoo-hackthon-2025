const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: [
      'question_answered',
      'answer_accepted',
      'answer_upvoted',
      'question_upvoted',
      'comment_added',
      'mention',
      'achievement_earned',
      'level_up',
      'moderation_action',
      'system_alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
    commentId: { type: mongoose.Schema.Types.ObjectId },
    achievement: { type: String },
    level: { type: String },
    points: { type: Number }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to get notifications for user
notificationSchema.statics.getForUser = function(userId, limit = 20, skip = 0) {
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatar')
    .populate('data.questionId', 'title slug')
    .populate('data.answerId', 'content');
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

// Static method to create achievement notification
notificationSchema.statics.createAchievementNotification = function(userId, achievement) {
  return this.create({
    recipient: userId,
    type: 'achievement_earned',
    title: 'Achievement Unlocked! 🎉',
    message: `You've earned the "${achievement.name}" achievement!`,
    data: { achievement: achievement.name },
    priority: 'high'
  });
};

// Static method to create level up notification
notificationSchema.statics.createLevelUpNotification = function(userId, newLevel, points) {
  return this.create({
    recipient: userId,
    type: 'level_up',
    title: 'Level Up! ⬆️',
    message: `Congratulations! You've reached ${newLevel} level with ${points} StackPoints!`,
    data: { level: newLevel, points: points },
    priority: 'high'
  });
};

// Static method to create answer accepted notification
notificationSchema.statics.createAnswerAcceptedNotification = function(answerId, questionId, acceptedBy) {
  return this.create({
    recipient: acceptedBy,
    type: 'answer_accepted',
    title: 'Answer Accepted! ✅',
    message: 'Your answer has been accepted as the best solution!',
    data: { answerId: answerId, questionId: questionId },
    priority: 'high'
  });
};

// Static method to create question answered notification
notificationSchema.statics.createQuestionAnsweredNotification = function(questionId, answerId, questionAuthor, answerAuthor) {
  return this.create({
    recipient: questionAuthor,
    sender: answerAuthor,
    type: 'question_answered',
    title: 'New Answer Received! 💡',
    message: 'Someone has answered your question!',
    data: { questionId: questionId, answerId: answerId },
    priority: 'medium'
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 
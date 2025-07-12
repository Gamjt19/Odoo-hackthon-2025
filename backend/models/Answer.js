const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  // Voting system
  upvotes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  downvotes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  // Status
  isAccepted: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Rich content
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Code blocks and formatting
  codeBlocks: [{
    language: String,
    code: String,
    description: String
  }],
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationReason: {
    type: String,
    default: null
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  // Comments on answers
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  // Confidence Booster tracking
  confidenceBoosterAwarded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ upvotes: -1 });

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual for comment count
answerSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to toggle vote
answerSchema.methods.toggleVote = function(userId, voteType) {
  const upvoteIndex = this.upvotes.findIndex(vote => vote.user.toString() === userId.toString());
  const downvoteIndex = this.downvotes.findIndex(vote => vote.user.toString() === userId.toString());
  
  if (voteType === 'upvote') {
    if (upvoteIndex > -1) {
      // Remove upvote
      this.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote, remove downvote if exists
      if (downvoteIndex > -1) {
        this.downvotes.splice(downvoteIndex, 1);
      }
      this.upvotes.push({ user: userId });
    }
  } else if (voteType === 'downvote') {
    if (downvoteIndex > -1) {
      // Remove downvote
      this.downvotes.splice(downvoteIndex, 1);
    } else {
      // Add downvote, remove upvote if exists
      if (upvoteIndex > -1) {
        this.upvotes.splice(upvoteIndex, 1);
      }
      this.downvotes.push({ user: userId });
    }
  }
  
  return this.save();
};

// Method to accept answer
answerSchema.methods.accept = function(acceptedBy) {
  this.isAccepted = true;
  this.acceptedAt = new Date();
  this.acceptedBy = acceptedBy;
  
  // Award Confidence Booster badge if anonymous
  if (this.isAnonymous && !this.confidenceBoosterAwarded) {
    this.confidenceBoosterAwarded = true;
  }
  
  return this.save();
};

// Method to unaccept answer
answerSchema.methods.unaccept = function() {
  this.isAccepted = false;
  this.acceptedAt = null;
  this.acceptedBy = null;
  return this.save();
};

// Method to add comment
answerSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content
  });
  return this.save();
};

// Method to remove comment
answerSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId.toString());
  return this.save();
};

// Method to mark as helpful
answerSchema.methods.markHelpful = function() {
  this.helpfulCount += 1;
  return this.save();
};

// Method to add view
answerSchema.methods.addView = function() {
  this.views += 1;
  return this.save();
};

// Method to get public data (without sensitive info)
answerSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    content: this.content,
    author: this.isAnonymous ? null : this.author,
    isAnonymous: this.isAnonymous,
    question: this.question,
    votes: this.voteCount,
    voteCount: this.voteCount,
    commentCount: this.commentCount,
    isAccepted: this.isAccepted,
    acceptedAt: this.acceptedAt,
    images: this.images,
    attachments: this.attachments,
    codeBlocks: this.codeBlocks,
    comments: this.comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    })),
    views: this.views,
    helpfulCount: this.helpfulCount,
    confidenceBoosterAwarded: this.confidenceBoosterAwarded,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get best answers
answerSchema.statics.getBestAnswers = function(limit = 10) {
  return this.find({ isAccepted: true })
    .sort({ voteCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('author', 'username avatar level')
    .populate('question', 'title slug');
};

// Static method to get answers by user
answerSchema.statics.getByUser = function(userId, limit = 20) {
  return this.find({ author: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('question', 'title slug category')
    .populate('author', 'username avatar level');
};

module.exports = mongoose.model('Answer', answerSchema); 
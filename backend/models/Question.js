const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
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
  isAnonymous: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['programming', 'design', 'business', 'marketing', 'general', 'education', 'technology', 'health', 'finance', 'lifestyle']
  },
  status: {
    type: String,
    enum: ['open', 'answered', 'closed', 'duplicate', 'off-topic'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
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
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  // Comments
  comments: [{
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  // Analytics
  lastActivity: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date,
    default: null
  },
  // SEO and discovery
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaDescription: {
    type: String,
    maxlength: 160
  }
}, {
  timestamps: true
});

// Indexes for performance
questionSchema.index({ title: 'text', content: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ upvotes: -1 });
questionSchema.index({ views: -1 });

// Pre-save middleware to generate slug
questionSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual for vote count
questionSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual for answer count
questionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

// Method to add view
questionSchema.methods.addView = function() {
  this.views += 1;
  this.lastActivity = new Date();
  return this.save();
};

// Method to toggle vote
questionSchema.methods.toggleVote = function(userId, voteType) {
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
questionSchema.methods.acceptAnswer = function(answerId) {
  this.acceptedAnswer = answerId;
  this.status = 'answered';
  this.lastActivity = new Date();
  return this.save();
};

// Method to add comment
questionSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    content,
    author: userId
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to remove comment
questionSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  this.lastActivity = new Date();
  return this.save();
};

// Method to add answer
questionSchema.methods.addAnswer = function(answerId) {
  if (!this.answers.includes(answerId)) {
    this.answers.push(answerId);
    this.lastActivity = new Date();
    if (this.status === 'open') {
      this.status = 'answered';
    }
  }
  return this.save();
};

// Method to get public data (without sensitive info)
questionSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    title: this.title,
    content: this.content,
    author: this.isAnonymous ? null : this.author,
    isAnonymous: this.isAnonymous,
    tags: this.tags,
    category: this.category,
    status: this.status,
    priority: this.priority,
    votes: this.voteCount,
    voteCount: this.voteCount,
    answerCount: this.answerCount,
    views: this.views,
    acceptedAnswer: this.acceptedAnswer,
    comments: this.comments,
    images: this.images,
    attachments: this.attachments,
    featured: this.featured,
    slug: this.slug,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastActivity: this.lastActivity
  };
};

// Static method to get trending questions
questionSchema.statics.getTrending = function(limit = 10) {
  return this.find({ status: { $ne: 'closed' } })
    .sort({ views: -1, voteCount: -1 })
    .limit(limit)
    .populate('author', 'username avatar level')
    .populate('acceptedAnswer');
};

// Static method to search questions
questionSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query }
  };
  
  if (filters.category) searchQuery.category = filters.category;
  if (filters.status) searchQuery.status = filters.status;
  if (filters.tags && filters.tags.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'username avatar level')
    .populate('acceptedAnswer');
};

module.exports = mongoose.model('Question', questionSchema); 
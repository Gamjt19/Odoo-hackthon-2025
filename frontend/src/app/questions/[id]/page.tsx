'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Eye, 
  Clock, 
  User, 
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Flag,
  Share,
  Bookmark,
  MoreHorizontal,
  Send,
  Award
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  avatar: string;
  level: string;
  stackPoints: number;
}

interface Answer {
  _id: string;
  content: string;
  author: User;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: User;
  category: string;
  tags: string[];
  votes: number;
  views: number;
  answersCount: number;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  acceptedAnswer?: string;
  comments: Comment[];
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showQuestionComments, setShowQuestionComments] = useState(false);

  useEffect(() => {
    fetchQuestionData();
    fetchCurrentUser();
  }, [questionId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchQuestionData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
        setAnswers(data.answers || []);
      } else if (response.status === 404) {
        // Question not found
        router.push('/questions');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'question' | 'answer', id: string, voteType: 'up' | 'down') => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Convert frontend vote types to backend expected format
    const backendVoteType = voteType === 'up' ? 'upvote' : 'downvote';

    console.log(`Voting ${backendVoteType} on ${type} ${id}`);

    try {
      const token = localStorage.getItem('accessToken');
      const url = `${process.env.NEXT_PUBLIC_API_URL}/${type}s/${id}/vote`;
      console.log('Voting URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType: backendVoteType })
      });

      console.log('Vote response status:', response.status);

      if (response.ok) {
        console.log('Vote successful, refreshing data...');
        // Refresh the data
        fetchQuestionData();
      } else {
        const errorData = await response.json();
        console.error('Vote error:', errorData);
        alert(errorData.error || 'Error voting');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error voting');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/accept-answer/${answerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchQuestionData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error accepting answer');
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
      alert('Error accepting answer');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !currentUser) return;

    // Frontend validation to match backend requirements
    if (newAnswer.trim().length < 10) {
      alert('Answer must be at least 10 characters long');
      return;
    }

    if (newAnswer.trim().length > 10000) {
      alert('Answer must be less than 10,000 characters');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newAnswer })
      });

      if (response.ok) {
        setNewAnswer('');
        fetchQuestionData();
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          alert(errorData.errors[0].msg || 'Error submitting answer');
        } else {
          alert('Error submitting answer');
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error submitting answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newComment
        })
      });

      if (response.ok) {
        setNewComment('');
        setCommentingOn(null);
        fetchQuestionData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error submitting comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitAnswerComment = async (e: React.FormEvent, answerId: string) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers/${answerId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newComment
        })
      });

      if (response.ok) {
        setNewComment('');
        setCommentingOn(null);
        fetchQuestionData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error submitting comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Question not found</h2>
          <p className="text-gray-600 mb-4">The question you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/questions"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link
              href="/questions"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 line-clamp-2">{question.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Asked {formatRelativeTime(question.createdAt)}</span>
                <span>•</span>
                <span>{question.views} views</span>
                <span>•</span>
                <span>{answers.length} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {question.isAnonymous ? (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {question.isAnonymous ? 'Anonymous User' : question.author.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {question.author.level} • {question.author.stackPoints} points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Share className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Bookmark className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-800 whitespace-pre-wrap">{question.content}</p>
                </div>

                {/* Question Tags */}
                <div className="flex items-center gap-2 mb-6">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Question Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote('question', question._id, 'up')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4 text-gray-500" />
                      </button>
                      <span className="font-medium text-gray-900">{question.votes}</span>
                      <button
                        onClick={() => handleVote('question', question._id, 'down')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowQuestionComments(!showQuestionComments)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Comment</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Asked {formatRelativeTime(question.createdAt)}</span>
                  </div>
                </div>

                {/* Question Comments */}
                {showQuestionComments && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
                    
                    {/* Comment Form */}
                    {currentUser && (
                      <form onSubmit={handleSubmitComment} className="mb-6">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="Add a comment..."
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-500">
                            {newComment.trim().length}/1000 characters
                          </p>
                          <button
                            type="submit"
                            disabled={!newComment.trim() || submittingComment}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingComment ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                      {question.comments && question.comments.length > 0 ? (
                        question.comments.map((comment) => (
                          <div key={comment._id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{comment.author.username}</span>
                                <span className="text-sm text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                              </div>
                              <p className="text-gray-800">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Answers Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  {answers.length} Answer{answers.length !== 1 ? 's' : ''}
                </h2>
              </div>

              {/* Answers List */}
              <div className="divide-y divide-gray-100">
                {answers.map((answer) => (
                  <div key={answer._id} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Vote Buttons */}
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => handleVote('answer', answer._id, 'up')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4 text-gray-500" />
                        </button>
                        <span className="font-medium text-gray-900">{answer.votes}</span>
                        <button
                          onClick={() => handleVote('answer', answer._id, 'down')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ThumbsDown className="h-4 w-4 text-gray-500" />
                        </button>
                        {answer.isAccepted && (
                          <div className="mt-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          </div>
                        )}
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1">
                        <div className="prose max-w-none mb-4">
                          <p className="text-gray-800 whitespace-pre-wrap">{answer.content}</p>
                        </div>

                        {/* Answer Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{answer.author.username}</p>
                                <p className="text-sm text-gray-500">
                                  {answer.author.level} • {answer.author.stackPoints} points
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(answer.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentUser && question.author._id === currentUser._id && !answer.isAccepted && (
                              <button
                                onClick={() => handleAcceptAnswer(answer._id)}
                                className="flex items-center gap-2 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Accept</span>
                              </button>
                            )}
                            <button 
                              onClick={() => setCommentingOn(commentingOn === answer._id ? null : answer._id)}
                              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>Comment</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Answer Comment Form */}
                    {commentingOn === answer._id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <form onSubmit={(e) => handleSubmitAnswerComment(e, answer._id)}>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            placeholder="Add a comment to this answer..."
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-gray-500">
                              {newComment.trim().length}/1000 characters
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setCommentingOn(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={!newComment.trim() || submittingComment}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submittingComment ? 'Posting...' : 'Post Comment'}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Answer Comments */}
                    {answer.comments && answer.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {answer.comments.map((comment) => (
                          <div key={comment._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg ml-12">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">{comment.author.username}</span>
                                <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                              </div>
                              <p className="text-gray-800 text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Form */}
            {currentUser && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
                  <form onSubmit={handleSubmitAnswer}>
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Write your answer here..."
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        <p>Be specific and provide enough context</p>
                        <p className={`mt-1 ${newAnswer.trim().length < 10 && newAnswer.trim().length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {newAnswer.trim().length}/10,000 characters (minimum 10)
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={!newAnswer.trim() || newAnswer.trim().length < 10 || submittingAnswer}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {submittingAnswer ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Post Answer
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {!currentUser && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Sign in to answer</h3>
                <p className="text-blue-800 mb-4">You need to be signed in to post an answer.</p>
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Question Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">{question.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Votes</span>
                  <span className="font-semibold text-gray-900">{question.votes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Answers</span>
                  <span className="font-semibold text-gray-900">{answers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-semibold text-gray-900 capitalize">{question.category}</span>
                </div>
              </div>
            </div>

            {/* Related Questions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Questions</h3>
              <p className="text-sm text-gray-500">Related questions will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
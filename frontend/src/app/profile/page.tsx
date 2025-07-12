'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Award, 
  TrendingUp, 
  MessageSquare, 
  Eye, 
  ThumbsUp, 
  Clock,
  BookOpen,
  Users,
  Activity,
  Settings,
  LogOut
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  stackPoints: number;
  reputation: number;
  level: string;
  role: string;
  joinDate: string;
  lastActive: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    allowAnonymous: boolean;
  };
  badges: string[];
  questionsCount: number;
  answersCount: number;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  votes: number;
  answersCount: number;
  views: number;
  createdAt: string;
  isAnonymous: boolean;
}

interface Answer {
  _id: string;
  content: string;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  question: {
    _id: string;
    title: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers'>('overview');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        fetchUserQuestions(userData._id);
        fetchUserAnswers(userData._id);
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQuestions = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/questions?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching user questions:', error);
    }
  };

  const fetchUserAnswers = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/answers?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data.answers);
      }
    } catch (error) {
      console.error('Error fetching user answers:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account and view activity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {user.level}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                  <p className="text-gray-600 text-sm">{user.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">StackPoints</span>
                  <span className="font-semibold text-gray-900">{user.stackPoints}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reputation</span>
                  <span className="font-semibold text-gray-900">{user.reputation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Questions</span>
                  <span className="font-semibold text-gray-900">{user.questionsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Answers</span>
                  <span className="font-semibold text-gray-900">{user.answersCount}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Badges</h3>
                <div className="space-y-2">
                  {user.badges.length > 0 ? (
                    user.badges.map((badge) => (
                      <div key={badge} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">{badge}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No badges yet. Keep contributing!</p>
                  )}
                </div>
              </div>

              {/* Member Since */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Member Since</h3>
                <p className="text-sm text-gray-600">{formatDate(user.joinDate)}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="border-b border-gray-100">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'questions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Questions ({user.questionsCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('answers')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'answers'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Answers ({user.answersCount})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Recent Questions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Questions</h3>
                      <div className="space-y-4">
                        {questions.slice(0, 3).map((question) => (
                          <div key={question._id} className="p-4 border border-gray-200 rounded-lg">
                            <Link 
                              href={`/questions/${question._id}`}
                              className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {question.title}
                            </Link>
                            <p className="text-gray-600 mt-2 line-clamp-2">{question.content}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{question.votes}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MessageSquare className="h-4 w-4" />
                                <span>{question.answersCount}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(question.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Answers */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Answers</h3>
                      <div className="space-y-4">
                        {answers.slice(0, 3).map((answer) => (
                          <div key={answer._id} className="p-4 border border-gray-200 rounded-lg">
                            <Link 
                              href={`/questions/${answer.question._id}`}
                              className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {answer.question.title}
                            </Link>
                            <p className="text-gray-600 mt-2 line-clamp-2">{answer.content}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{answer.votes}</span>
                              </div>
                              {answer.isAccepted && (
                                <div className="flex items-center gap-1 text-sm text-green-600">
                                  <Award className="h-4 w-4" />
                                  <span>Accepted</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(answer.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'questions' && (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question._id} className="p-4 border border-gray-200 rounded-lg">
                        <Link 
                          href={`/questions/${question._id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {question.title}
                        </Link>
                        <p className="text-gray-600 mt-2 line-clamp-2">{question.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{question.votes}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MessageSquare className="h-4 w-4" />
                            <span>{question.answersCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span>{question.views}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'answers' && (
                  <div className="space-y-4">
                    {answers.map((answer) => (
                      <div key={answer._id} className="p-4 border border-gray-200 rounded-lg">
                        <Link 
                          href={`/questions/${answer.question._id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {answer.question.title}
                        </Link>
                        <p className="text-gray-600 mt-2 line-clamp-2">{answer.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{answer.votes}</span>
                          </div>
                          {answer.isAccepted && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <Award className="h-4 w-4" />
                              <span>Accepted</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(answer.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
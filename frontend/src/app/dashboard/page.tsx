'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  MessageSquare, 
  Award, 
  Eye, 
  ThumbsUp, 
  Clock,
  Filter,
  BookOpen,
  Users,
  Activity
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  stackPoints: number;
  reputation: number;
  questionsCount: number;
  answersCount: number;
  badges: string[];
  joinDate: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    username: string;
  };
  votes: number;
  answersCount: number;
  views: number;
  createdAt: string;
  isAnonymous: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchRecentQuestions();
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

  const fetchRecentQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions?limit=5&sort=newest`);
      if (response.ok) {
        const data = await response.json();
        setRecentQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching recent questions:', error);
    }
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
          <p className="text-gray-600">Loading dashboard...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.username}!</p>
            </div>
            <Link
              href="/ask"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ask Question
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">StackPoints</p>
                    <p className="text-2xl font-bold text-gray-900">{user.stackPoints}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+{Math.floor(user.stackPoints * 0.1)} this week</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reputation</p>
                    <p className="text-2xl font-bold text-gray-900">{user.reputation}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>Level {Math.floor(user.reputation / 100) + 1}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Questions</p>
                    <p className="text-2xl font-bold text-gray-900">{user.questionsCount}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{user.answersCount} answers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Questions</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {recentQuestions.map((question) => (
                  <div key={question._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                        <div className="flex items-center gap-2 mt-3">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-100">
                <Link
                  href="/questions"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all questions →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/ask"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Ask a Question</span>
                </Link>
                <Link
                  href="/questions"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Search className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">Browse Questions</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900">View Profile</span>
                </Link>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h3>
              <div className="space-y-3">
                {user.badges.length > 0 ? (
                  user.badges.map((badge) => (
                    <div key={badge} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="h-4 w-4 text-yellow-600" />
                      </div>
                      <span className="font-medium text-gray-900">{badge}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No badges yet. Keep contributing to earn badges!</p>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Since</h3>
              <p className="text-gray-600">{formatDate(user.joinDate)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
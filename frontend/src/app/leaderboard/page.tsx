'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Medal, 
  Award, 
  Users, 
  MessageSquare, 
  Eye, 
  TrendingUp,
  Calendar,
  Star,
  CheckCircle
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  avatar: string | null;
  level: string;
  stackPoints: number;
  stats: {
    questionsAsked: number;
    answersGiven: number;
    acceptedAnswers: number;
    totalViews: number;
    joinDate: string;
  };
  badges: string[];
}

interface LeaderboardData {
  topUsers: User[];
  topContributors: User[];
  topAnswerers: User[];
  recentAchievers: User[];
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/leaderboard`);
      console.log('Leaderboard response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Leaderboard data:', data);
        setLeaderboardData(data);
      } else {
        console.error('Leaderboard response not ok:', response.status);
        // Fallback to sample data for testing
        setLeaderboardData({
          topUsers: [
            {
              _id: '1',
              username: 'JohnDoe',
              avatar: null,
              level: 'Expert',
              stackPoints: 1250,
              stats: {
                questionsAsked: 15,
                answersGiven: 45,
                acceptedAnswers: 12,
                totalViews: 1200,
                joinDate: '2024-01-15'
              },
              badges: ['Expert Contributor', 'Answer Ace']
            },
            {
              _id: '2',
              username: 'JaneSmith',
              avatar: null,
              level: 'Advanced',
              stackPoints: 890,
              stats: {
                questionsAsked: 8,
                answersGiven: 32,
                acceptedAnswers: 8,
                totalViews: 850,
                joinDate: '2024-02-01'
              },
              badges: ['Helper', 'Rising Star']
            }
          ],
          topContributors: [],
          topAnswerers: [],
          recentAchievers: []
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Fallback to sample data for testing
      setLeaderboardData({
        topUsers: [
          {
            _id: '1',
            username: 'JohnDoe',
            avatar: null,
            level: 'Expert',
            stackPoints: 1250,
            stats: {
              questionsAsked: 15,
              answersGiven: 45,
              acceptedAnswers: 12,
              totalViews: 1200,
              joinDate: '2024-01-15'
            },
            badges: ['Expert Contributor', 'Answer Ace']
          },
          {
            _id: '2',
            username: 'JaneSmith',
            avatar: null,
            level: 'Advanced',
            stackPoints: 890,
            stats: {
              questionsAsked: 8,
              answersGiven: 32,
              acceptedAnswers: 8,
              totalViews: 850,
              joinDate: '2024-02-01'
            },
            badges: ['Helper', 'Rising Star']
          }
        ],
        topContributors: [],
        topAnswerers: [],
        recentAchievers: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return 'text-purple-600 bg-purple-100';
      case 'advanced':
        return 'text-blue-600 bg-blue-100';
      case 'intermediate':
        return 'text-green-600 bg-green-100';
      case 'beginner':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-gray-600 mt-1">Top contributors and achievers in our community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => setActiveTab('overall')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overall'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy className="h-4 w-4 inline mr-2" />
            Overall
          </button>
          <button
            onClick={() => setActiveTab('contributors')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'contributors'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Top Contributors
          </button>
          <button
            onClick={() => setActiveTab('answerers')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'answerers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Top Answerers
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Recent Achievers
          </button>
        </div>

        {/* Leaderboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'overall' && 'Top Users by StackPoints'}
                {activeTab === 'contributors' && 'Most Active Contributors'}
                {activeTab === 'answerers' && 'Best Answerers'}
                {activeTab === 'recent' && 'Recent Achievers'}
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {(leaderboardData?.topUsers || []).length > 0 ? (
                (leaderboardData?.topUsers || []).slice(0, 10).map((user, index) => (
                  <div key={user._id} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index + 1)}
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{user.username}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.level)}`}>
                            {user.level}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {user.stackPoints} points
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {user.stats.questionsAsked} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {user.stats.answersGiven} answers
                          </span>
                          {user.stats.acceptedAnswers > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {user.stats.acceptedAnswers} accepted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users yet</h3>
                  <p className="text-gray-600">Be the first to join and start earning points!</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{(leaderboardData?.topUsers || []).length}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {(leaderboardData?.topUsers || []).reduce((sum, user) => sum + user.stats.answersGiven, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Answers</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {(leaderboardData?.topUsers || []).reduce((sum, user) => sum + user.stats.totalViews, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {(leaderboardData?.topUsers || []).reduce((sum, user) => sum + user.stackPoints, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
              </div>
            </div>

            {/* Top Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Badges</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Expert Contributor</span>
                  </div>
                  <span className="text-sm text-gray-600">15 users</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Answer Ace</span>
                  </div>
                  <span className="text-sm text-gray-600">8 users</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Rising Star</span>
                  </div>
                  <span className="text-sm text-gray-600">12 users</span>
                </div>
              </div>
            </div>

            {/* How to Earn Points */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Earn Points</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Ask a question</span>
                  <span className="font-medium text-green-600">+5 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Answer a question</span>
                  <span className="font-medium text-green-600">+10 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Get answer accepted</span>
                  <span className="font-medium text-green-600">+15 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Receive upvote</span>
                  <span className="font-medium text-green-600">+2 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Daily login streak</span>
                  <span className="font-medium text-green-600">+1 point</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
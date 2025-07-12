'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Trophy,
  Menu,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const Navigation: React.FC = () => {
  const { user, logout } = useAuth()
  const { trackPageView } = useAnalytics()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      trackPageView(`search:${searchQuery}`)
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Master': return 'text-purple-600 bg-purple-100'
      case 'Expert': return 'text-red-600 bg-red-100'
      case 'Advanced': return 'text-orange-600 bg-orange-100'
      case 'Intermediate': return 'text-blue-600 bg-blue-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-gray-900"
            onClick={() => trackPageView('home')}
          >
            <Trophy className="h-8 w-8 text-blue-600" />
            <span>QA Platform</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/questions" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => trackPageView('questions')}
            >
              Questions
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => trackPageView('leaderboard')}
            >
              Leaderboard
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/ask" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-1"
                  onClick={() => trackPageView('ask')}
                >
                  <Plus className="h-4 w-4" />
                  <span>Ask Question</span>
                </Link>

                {/* Notifications */}
                <button className="relative p-2 text-gray-700 hover:text-blue-600">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium">{user.username}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getLevelColor(user.level)}`}>
                        {user.level} • {user.stackPoints} pts
                      </div>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => trackPageView('login')}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  onClick={() => trackPageView('register')}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              <Link 
                href="/questions" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => {
                  trackPageView('questions')
                  setIsMenuOpen(false)
                }}
              >
                Questions
              </Link>
              <Link 
                href="/leaderboard" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => {
                  trackPageView('leaderboard')
                  setIsMenuOpen(false)
                }}
              >
                Leaderboard
              </Link>

              {user ? (
                <>
                  <Link 
                    href="/ask" 
                    className="block px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                    onClick={() => {
                      trackPageView('ask')
                      setIsMenuOpen(false)
                    }}
                  >
                    Ask Question
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => {
                      trackPageView('dashboard')
                      setIsMenuOpen(false)
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => {
                      trackPageView('profile')
                      setIsMenuOpen(false)
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => {
                      trackPageView('login')
                      setIsMenuOpen(false)
                    }}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                    onClick={() => {
                      trackPageView('register')
                      setIsMenuOpen(false)
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation 
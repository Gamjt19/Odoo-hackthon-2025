'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Bell, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  User, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Trash2,
  Check,
  X
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  sender?: {
    _id: string
    username: string
    avatar?: string
  }
  data?: {
    questionId?: {
      _id: string
      title: string
      slug: string
    }
    answerId?: {
      _id: string
      content: string
    }
    achievement?: string
    level?: string
    points?: number
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    if (!user) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      })
      
      if (filter === 'unread') {
        params.append('unreadOnly', 'true')
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications?${params}`)
      
      if (reset) {
        setNotifications(response.data.notifications)
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications])
      }
      
      setHasMore(response.data.pagination.hasNext)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  // Load notifications on mount and filter change
  useEffect(() => {
    if (user) {
      fetchNotifications(1, true)
    }
  }, [user, filter])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`)
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`)
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }

  // Delete selected notifications
  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return

    try {
      await Promise.all(
        selectedNotifications.map(id => 
          axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`)
        )
      )
      
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.includes(notif._id))
      )
      setSelectedNotifications([])
      toast.success('Selected notifications deleted')
    } catch (error) {
      console.error('Error deleting notifications:', error)
      toast.error('Failed to delete notifications')
    }
  }

  // Toggle notification selection
  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  // Select all notifications
  const selectAll = () => {
    setSelectedNotifications(notifications.map(n => n._id))
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedNotifications([])
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'question_answered':
        return <MessageSquare className="h-5 w-5 text-blue-600" />
      case 'answer_accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'answer_upvoted':
      case 'question_upvoted':
        return <ThumbsUp className="h-5 w-5 text-orange-600" />
      case 'comment_added':
        return <MessageSquare className="h-5 w-5 text-purple-600" />
      case 'mention':
        return <User className="h-5 w-5 text-indigo-600" />
      case 'achievement_earned':
        return <Award className="h-5 w-5 text-yellow-600" />
      case 'level_up':
        return <Award className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedNotifications.length > 0 ? (
                <>
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedNotifications.length})
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    Mark all read
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Read
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! We'll notify you when something happens."
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            {selectedNotifications.length === 0 && (
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select all
                </button>
              </div>
            )}

            {/* Notifications */}
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg border transition-all ${
                  !notification.isRead 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  selectedNotifications.includes(notification._id)
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => toggleSelection(notification._id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Question/Answer Link */}
                          {notification.data?.questionId && (
                            <Link
                              href={`/questions/${notification.data.questionId._id}`}
                              className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                              onClick={() => markAsRead(notification._id)}
                            >
                              {notification.data.questionId.title}
                            </Link>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sender Info */}
                      {notification.sender && (
                        <div className="flex items-center gap-2 mt-3">
                          {notification.sender.avatar ? (
                            <img
                              src={notification.sender.avatar}
                              alt={notification.sender.username}
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {notification.sender.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {notification.sender.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={() => fetchNotifications(page + 1)}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
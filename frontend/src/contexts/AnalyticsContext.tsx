'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
  trackPageView: (page: string) => void
  trackQuestionView: (questionId: string, title: string) => void
  trackAnswerSubmit: (questionId: string) => void
  trackVote: (type: 'upvote' | 'downvote', contentType: 'question' | 'answer', contentId: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  useEffect(() => {
    // Initialize analytics if enabled
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
      console.log('Analytics enabled')
    }
  }, [])

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          userId: user?._id,
          timestamp: new Date().toISOString(),
        }
      }
      
      // Send to analytics endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      }).catch(console.error)
    }
  }

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page })
  }

  const trackQuestionView = (questionId: string, title: string) => {
    trackEvent('question_view', { questionId, title })
  }

  const trackAnswerSubmit = (questionId: string) => {
    trackEvent('answer_submit', { questionId })
  }

  const trackVote = (type: 'upvote' | 'downvote', contentType: 'question' | 'answer', contentId: string) => {
    trackEvent('vote', { type, contentType, contentId })
  }

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackQuestionView,
    trackAnswerSubmit,
    trackVote
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
} 
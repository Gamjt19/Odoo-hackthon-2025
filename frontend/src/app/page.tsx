'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { 
  Trophy, 
  Users, 
  MessageSquare, 
  Award, 
  Zap, 
  Shield,
  ArrowRight,
  Star,
  TrendingUp,
  Lightbulb
} from 'lucide-react'
import { motion } from 'framer-motion'

const HomePage: React.FC = () => {
  const { user } = useAuth()
  const { trackPageView } = useAnalytics()

  React.useEffect(() => {
    trackPageView('home')
  }, [trackPageView])

  const features = [
    {
      icon: MessageSquare,
      title: 'Rich Q&A Experience',
      description: 'Ask questions with rich text formatting, code blocks, images, and more. Get detailed, helpful answers from the community.',
      color: 'text-blue-600'
    },
    {
      icon: Trophy,
      title: 'StackPoints & Gamification',
      description: 'Earn points for helping others, unlock achievements, and climb the leaderboard. Make learning fun and rewarding.',
      color: 'text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Anonymous Q&A Mode',
      description: 'Shy about asking questions? Post anonymously and build confidence. Get a special badge when your anonymous answer is accepted.',
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Vibrant Community',
      description: 'Connect with learners, experts, and mentors. Share knowledge, get feedback, and grow together.',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications for answers, upvotes, achievements, and community activity.',
      color: 'text-orange-600'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track your progress, see your impact, and understand your learning journey with detailed analytics.',
      color: 'text-red-600'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Questions Asked' },
    { number: '50K+', label: 'Answers Given' },
    { number: '5K+', label: 'Active Users' },
    { number: '100K+', label: 'StackPoints Awarded' }
  ]

  const achievements = [
    { name: 'Answer Streak 🔥', description: 'Answered questions for 7 consecutive days' },
    { name: 'Problem Solver 🧠', description: 'Had 10 answers accepted' },
    { name: 'Confidence Booster 🌟', description: 'Had an anonymous answer accepted' },
    { name: 'Helper 🆘', description: 'Helped 5 people with answers' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Trophy className="h-20 w-20 mx-auto mb-6 text-yellow-300" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Learn, Share, and
                <span className="text-yellow-300"> Grow Together</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Join our vibrant Q&A community where knowledge flows freely. Ask questions, 
                share expertise, and earn rewards while helping others learn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link
                    href="/ask"
                    className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => trackPageView('ask')}
                  >
                    <span>Ask a Question</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors"
                      onClick={() => trackPageView('register')}
                    >
                      Get Started Free
                    </Link>
                    <Link
                      href="/login"
                      className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                      onClick={() => trackPageView('login')}
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the ultimate learning community with features designed to make 
              knowledge sharing engaging, rewarding, and accessible to everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Unlock Achievements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Earn badges and recognition as you help others and grow your expertise.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200"
              >
                <div className="text-2xl mb-3">{achievement.name}</div>
                <p className="text-gray-700 text-sm">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Lightbulb className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of learners who are already asking questions, 
              sharing knowledge, and earning rewards.
            </p>
            {user ? (
              <Link
                href="/questions"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center space-x-2"
                onClick={() => trackPageView('questions')}
              >
                <span>Explore Questions</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center space-x-2"
                onClick={() => trackPageView('register')}
              >
                <span>Join the Community</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <span className="text-xl font-bold">QA Platform</span>
              </div>
              <p className="text-gray-400">
                Empowering learners through knowledge sharing and community support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/questions" className="hover:text-white">Questions</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/discord" className="hover:text-white">Discord</Link></li>
                <li><Link href="/twitter" className="hover:text-white">Twitter</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QA Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

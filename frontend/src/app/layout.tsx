import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { SocketProvider } from '@/contexts/SocketContext'
import Navigation from '@/components/Navigation'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'QA Platform',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Learn, Share, and Grow Together',
  keywords: 'Q&A, questions, answers, learning, community, education',
  authors: [{ name: 'QA Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: process.env.NEXT_PUBLIC_APP_NAME || 'QA Platform',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Learn, Share, and Grow Together',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_APP_NAME || 'QA Platform',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Learn, Share, and Grow Together',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <AnalyticsProvider>
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </AnalyticsProvider>
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

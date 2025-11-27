'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getMe, getAvatarImage } from '@/lib/api'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userAvatar, setUserAvatar] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem('authToken')
      const accessToken = localStorage.getItem('accessToken')

      if (authToken && accessToken) {
        try {
          const auth = JSON.parse(authToken)
          if (auth.authenticated) {
            setIsAuthenticated(true)
            const data = await getMe(accessToken)
            setUserData(data)
            
            if (data.avatar) {
              const avatarUrl = await getAvatarImage(data.avatar)
              if (avatarUrl) {
                setUserAvatar(avatarUrl)
              }
            }
          }
        } catch (error) {
          console.error('[v0] Error fetching user data:', error)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsAuthenticated(false)
    setUserData(null)
    setUserAvatar(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-zinc-950 dark:to-zinc-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mF33O3bW6UY0TQTdzzTirbvfocHvkV.png" 
                alt="Rohde & Schwarz" 
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">Rohde & Schwarz</span>
            </Link>

            {/* Center Nav Items */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition">
                Features
              </a>
              <a href="#solutions" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition">
                Solutions
              </a>
              <a href="#about" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition">
                About
              </a>
            </div>

            {/* Right Nav Items */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {isLoading ? (
                <div className="h-8 w-8 animate-pulse bg-zinc-200 rounded-full dark:bg-zinc-800" />
              ) : isAuthenticated && userData ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/chat')}
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Open Chatbot
                  </button>

                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title={userData.name}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 overflow-hidden flex items-center justify-center">
                      {userAvatar ? (
                        <img src={userAvatar || "/placeholder.svg"} alt={userData.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {userData.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium hidden md:inline text-zinc-900 dark:text-white">
                      {userData.name}
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white text-balance">
            Shaping the Future of Security and Connectivity
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto text-balance">
            Independent, stable, and innovative solutions for a safer and connected world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/chat')}
                className="px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Go to Chatbot
              </button>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Get Started
                </Link>
                <Link
                  href="#solutions"
                  className="px-8 py-3 text-lg font-semibold text-zinc-900 dark:text-white border-2 border-zinc-900 dark:border-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-12">
          Your Trustworthy Partner in Technology
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Technological Sovereignty',
              description: 'Empowering you to maintain control over your digital future.',
              icon: '🔐',
            },
            {
              title: 'Innovation',
              description: '90+ years of living a tradition of cutting-edge development.',
              icon: '💡',
            },
            {
              title: 'Sustainability',
              description: 'Committed to social responsibility and sustainable lifecycles.',
              icon: '🌱',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-lg dark:hover:shadow-lg/20 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-12">
          Key Solutions & Industries
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            'Test & Measurement',
            'Technology Systems',
            'Networks & Cybersecurity',
            'Aerospace & Defense',
            'Automotive Testing',
            'Broadcast & Media',
          ].map((solution, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {solution}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
            90 Years of Innovation
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-zinc-600 dark:text-zinc-400">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Our Heritage</h3>
              <p>
                As a privately owned global company, we stand for independence, stability, and long-term partnerships.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Our Reach</h3>
              <p>
                100% Owned by founding families with 70+ subsidiaries worldwide, ensuring independence and global presence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            <p>Ensuring a safer and connected world.</p>
            <p className="mt-2 text-sm">
              © 2025 Rohde & Schwarz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

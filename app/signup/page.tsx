"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { signup } from "@/lib/api"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    
    setIsLoading(true)
    try {
      const response = await signup(fullName, email, password)
      
      // Store tokens and user data in localStorage
      localStorage.setItem("accessToken", response.access_token)
      localStorage.setItem("refreshToken", response.refresh_token)
      localStorage.setItem("tokenType", response.token_type)
      localStorage.setItem("authToken", JSON.stringify({ 
        email, 
        fullName, 
        authenticated: true, 
        timestamp: Date.now() 
      }))
      
      router.push("/")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account"
      setError(errorMessage)
      console.error("[v0] Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = (provider: string) => {
    console.log("[v0] Social signup with:", provider)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #fff5f7 35%, #ffe8f0 65%, #ffd6e8 100%)"
        }}
      ></div>
      
      <div 
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 35%, #121212 65%, #151515 100%)"
        }}
      ></div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md float-card">
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-2xl dark:shadow-lg overflow-hidden border border-white/30 dark:border-slate-700/50 backdrop-blur-sm">
          {/* Card Header */}
          <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6 text-center border-b border-gray-200 dark:border-slate-700">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create Account
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Join us to get started
            </p>
          </div>

          {/* Card Content */}
          <div className="px-6 md:px-8 pb-8 md:pb-10">
            {error && (
              <div 
                className="mb-5 p-3 md:p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm font-medium"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name Input */}
              <div className="space-y-2">
                <Label 
                  htmlFor="fullName" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  aria-label="Full name"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  aria-label="Email address"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  aria-label="Password"
                  aria-describedby="password-hint"
                />
                <p id="password-hint" className="text-xs text-gray-600 dark:text-gray-400">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label 
                  htmlFor="confirmPassword" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                  aria-label="Confirm password"
                />
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full py-3 md:py-4 mt-2 font-semibold text-base rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6 md:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-slate-900/80 text-gray-600 dark:text-gray-400 font-medium">
                  Or sign up with
                </span>
              </div>
            </div>

            {/* Social Signup Button */}
            <Button
              type="button"
              onClick={() => handleSocialSignup("Google")}
              variant="outline"
              className="w-full py-3 md:py-4 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-gray-800 dark:text-gray-100"
              aria-label="Sign up with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 2.43-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            {/* Sign In Link */}
            <div className="mt-6 md:mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

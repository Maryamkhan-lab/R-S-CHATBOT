"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { getMe, updateMe, getAvatarImage } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        if (!accessToken) {
          router.push("/login")
          return
        }

        const userData = await getMe(accessToken)
        
        setIsAuthenticated(true)
        setFormData(prev => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
        }))

        if (userData.avatar) {
          const avatarUrl = await getAvatarImage(userData.avatar)
          if (avatarUrl) {
            setProfileImage(avatarUrl)
          }
        }
      } catch (err) {
        console.error("[v0] Error loading user:", err)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ""
      }))
    }
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profileImage: "Please upload a valid image file"
        }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profileImage: "Image size should be less than 5MB"
        }))
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
        setErrors(prev => ({
          ...prev,
          profileImage: ""
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})
    setSuccessMessage("")

    try {
      const newErrors: Record<string, string> = {}
      
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email"
      }

      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          newErrors.currentPassword = "Current password is required to change password"
        }
        if (formData.newPassword.length < 8) {
          newErrors.newPassword = "New password must be at least 8 characters"
        }
        if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsSaving(false)
        return
      }

      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        router.push("/login")
        return
      }

      await updateMe(
        accessToken,
        formData.name,
        formData.email,
        formData.newPassword || undefined,
        avatarFile || undefined
      )

      if (previewImage) {
        setProfileImage(previewImage)
        setPreviewImage(null)
        setAvatarFile(null)
      }

      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile"
      console.error("[v0] Error saving profile:", error)
      setErrors({ submit: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("tokenType")
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden pb-8">
      {/* Background Gradient */}
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

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Back to Chat Link */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          aria-label="Back to chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="w-full max-w-2xl float-card">
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-2xl dark:shadow-lg overflow-hidden border border-white/30 dark:border-slate-700/50 backdrop-blur-sm">
          {/* Card Header */}
          <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6 text-center border-b border-gray-200 dark:border-slate-700">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Profile Settings
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Manage your account information and preferences
            </p>
          </div>

          {/* Card Content */}
          <div className="px-6 md:px-8 py-8 md:py-10">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800">
                <p className="text-green-800 dark:text-green-300 font-medium" role="alert">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                <p className="text-red-800 dark:text-red-300 font-medium" role="alert">
                  {errors.submit}
                </p>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 p-1">
                    {previewImage || profileImage ? (
                      <img 
                        src={previewImage || profileImage || ""} 
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-colors"
                    aria-label="Upload profile picture"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  aria-label="Profile picture upload"
                />
                {errors.profileImage && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.profileImage}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Click the icon to upload a new picture</p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-slate-700"></div>

              {/* Name Input */}
              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  aria-label="Full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
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
                  placeholder="your@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  aria-label="Email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Change Section */}
              <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Change Password (Optional)
                </h3>

                {/* Current Password */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="currentPassword" 
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    aria-label="Current password"
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="newPassword" 
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    aria-label="New password"
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="confirmPassword" 
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-500/30 transition-all duration-200 text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    aria-label="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 py-3 md:py-4 font-semibold text-base rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="outline"
                  className="flex-1 py-3 md:py-4 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-semibold text-gray-800 dark:text-gray-100"
                  aria-label="Sign out from profile"
                >
                  Sign Out
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

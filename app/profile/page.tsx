"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { api } from "@/lib/api" // Using the updated API definition
import { ArrowLeft, Upload, User as UserIcon } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  // --- 1. Load User Data ---
  useEffect(() => {
    setMounted(true)
    const loadUserData = async () => {
      try {
        const user = await api.user.getProfile()
        
        setFormData(prev => ({
          ...prev,
          name: user.full_name || "",
          email: user.email || "",
        }))

        if (user.avatar_url) {
          setProfileImage(user.avatar_url)
        }
      } catch (err) {
        console.error("Error loading user:", err)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  // --- 2. Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: "" }))
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: "Please upload a valid image file" }))
        return
      }
      // 5MB limit to allow for larger high-res avatars
      if (file.size > 5 * 1024 * 1024) { 
        setErrors(prev => ({ ...prev, profileImage: "Image size should be less than 5MB" }))
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
        setErrors(prev => ({ ...prev, profileImage: "" }))
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
      // 1. Validation
      const newErrors: Record<string, string> = {}
      if (!formData.name.trim()) newErrors.name = "Name is required"
      
      if (formData.newPassword || formData.confirmPassword) {
        if (formData.newPassword.length < 6) {
          newErrors.newPassword = "Password must be at least 6 characters"
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

      // 2. Prepare Payload
      // Using the specific interface we defined in api.ts
      const payload: { full_name?: string; avatar_url?: string; password?: string } = {
        full_name: formData.name,
      }

      // Only send avatar_url if a new one was selected
      if (previewImage) {
        payload.avatar_url = previewImage
      }

      // Only send password if user typed one
      if (formData.newPassword) {
        payload.password = formData.newPassword
      }

      // 3. Call API
      const updatedUser = await api.user.updateProfile(payload)

      // 4. Update Local State & Cache
      if (previewImage) {
        setProfileImage(previewImage)
        setPreviewImage(null)
      }
      
      // Update LocalStorage to reflect changes immediately
      const cachedUser = localStorage.getItem("user")
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser)
        localStorage.setItem("user", JSON.stringify({ 
          ...parsed, 
          full_name: updatedUser.full_name || formData.name, 
          avatar_url: updatedUser.avatar_url || parsed.avatar_url 
        }))
      }

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }))

      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)

    } catch (error: any) {
      console.error("Save error:", error)
      setErrors({ submit: error.message || "Failed to save profile" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    api.auth.logout()
    router.push("/login")
  }

  // --- 3. Loading State (Hydration Safe) ---
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    )
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
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="w-full max-w-2xl float-card mt-12 md:mt-0">
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-2xl dark:shadow-lg overflow-hidden border border-white/30 dark:border-slate-700/50 backdrop-blur-sm">
          
          {/* Header */}
          <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6 text-center border-b border-gray-200 dark:border-slate-700">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Profile Settings
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Manage your account information
            </p>
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 py-8 md:py-10">
            {successMessage && (
              <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800">
                <p className="text-green-800 dark:text-green-300 font-medium">{successMessage}</p>
              </div>
            )}

            {errors.submit && (
              <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                <p className="text-red-800 dark:text-red-300 font-medium">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 p-1 shadow-md">
                    {previewImage || profileImage ? (
                      <img 
                        src={previewImage || profileImage || ""} 
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover bg-white dark:bg-zinc-900"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-transform hover:scale-105"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
                
                <div className="text-center">
                  {errors.profileImage && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">{errors.profileImage}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click the upload icon to change photo
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700" />

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="py-3"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled // Emails are immutable
                    className="py-3 bg-gray-50 dark:bg-slate-800/50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 p-5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Change Password</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 py-6 font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="outline"
                  className="flex-1 py-6 border-2 font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
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
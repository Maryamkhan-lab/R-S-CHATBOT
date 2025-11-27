"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlertCircle, Upload, FileText, Trash2, Download, Plus } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadedFile {
  id: string
  name: string
  size: number
  uploadedAt: string
  progress?: number
}

export default function AdminDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "Sample Document.pdf",
      size: 2048576,
      uploadedAt: "2024-11-15",
    },
  ])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single")
  const [errorMessage, setErrorMessage] = useState("")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleSingleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    setErrorMessage("")

    try {
      Array.from(files).forEach((file) => {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          throw new Error("Only PDF files are allowed for single upload")
        }

        // Simulate upload progress
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 30
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)

            const newFile: UploadedFile = {
              id: Date.now().toString(),
              name: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString().split("T")[0],
            }
            setUploadedFiles((prev) => [newFile, ...prev])
            setUploadProgress(0)
          } else {
            setUploadProgress(progress)
          }
        }, 500)
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Upload failed"
      )
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleBulkZipUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    setErrorMessage("")

    try {
      Array.from(files).forEach((file) => {
        if (!file.name.toLowerCase().endsWith(".zip")) {
          throw new Error("Only ZIP files are allowed for bulk upload")
        }

        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 25
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)

            // Simulate extracting multiple PDFs from zip
            const pdfCount = Math.floor(Math.random() * 5) + 1
            for (let i = 0; i < pdfCount; i++) {
              const newFile: UploadedFile = {
                id: Date.now().toString() + i,
                name: `document_${i + 1}.pdf`,
                size: Math.floor(Math.random() * 5000000) + 1000000,
                uploadedAt: new Date().toISOString().split("T")[0],
              }
              setUploadedFiles((prev) => [newFile, ...prev])
            }
            setUploadProgress(0)
          } else {
            setUploadProgress(progress)
          }
        }, 400)
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Upload failed"
      )
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-8 relative overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, #fff5f7 35%, #ffe8f0 65%, #ffd6e8 100%)",
        }}
      ></div>

      <div
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 35%, #121212 65%, #151515 100%)",
        }}
      ></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            PDF Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage your PDF documents
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <Link href="/">
            <Button
              variant="outline"
              className="border-2 border-gray-300 dark:border-slate-600"
            >
              Back to Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert className="mb-6 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Sections */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Single File Upload */}
        <Card className="float-card bg-white dark:bg-slate-900/80 rounded-3xl shadow-2xl dark:shadow-lg border border-white/30 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Single PDF Upload
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Upload individual PDF files one at a time
            </p>

            <div className="space-y-4">
              <label className="block">
                <div className="relative border-2 border-dashed border-purple-300 dark:border-purple-500/50 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleSingleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    aria-label="Upload single PDF file"
                  />
                  <FileText className="w-12 h-12 text-purple-400 dark:text-purple-300 mx-auto mb-3" />
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    Click to browse or drag & drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    PDF files only (Max 10MB)
                  </p>
                </div>
              </label>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploading...
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Bulk ZIP Upload */}
        <Card className="float-card bg-white dark:bg-slate-900/80 rounded-3xl shadow-2xl dark:shadow-lg border border-white/30 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Bulk ZIP Upload
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Upload multiple PDFs at once using a ZIP archive
            </p>

            <div className="space-y-4">
              <label className="block">
                <div className="relative border-2 border-dashed border-pink-300 dark:border-pink-500/50 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500 dark:hover:border-pink-400 transition-colors">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleBulkZipUpload}
                    disabled={uploading}
                    className="hidden"
                    aria-label="Upload ZIP file with multiple PDFs"
                  />
                  <FileText className="w-12 h-12 text-pink-400 dark:text-pink-300 mx-auto mb-3" />
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    Click to browse or drag & drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ZIP files only (Max 50MB)
                  </p>
                </div>
              </label>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Processing...
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-600 to-purple-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* File Gallery */}
      <Card className="float-card bg-white dark:bg-slate-900/80 rounded-3xl shadow-2xl dark:shadow-lg border border-white/30 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Uploaded Documents ({uploadedFiles.length})
            </h2>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                No files uploaded yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Start by uploading your first PDF or ZIP file above
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 dark:text-gray-100 font-semibold truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(file.size)} • {file.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      aria-label={`Download ${file.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      onClick={() => handleDeleteFile(file.id)}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface FileUploadProps {
  onUploadSuccess: () => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuth()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [".csv", ".xlsx", ".xls"]
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf("."))

      if (!allowedTypes.includes(fileExtension)) {
        setError("Invalid file type. Please select a .csv, .xlsx, or .xls file.")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError("")
      setSuccess("")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        setSuccess(
          `${data.message}. Total items: ${data.totalItems}. Distribution: ${data.distributions
            .map((d: any) => `${d.agentName} (${d.itemCount} items)`)
            .join(", ")}`,
        )
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        onUploadSuccess()
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (error) {
      setError("Network error occurred")
    }

    setUploading(false)
    setTimeout(() => setUploadProgress(0), 1000)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const allowedTypes = [".csv", ".xlsx", ".xls"]
      const fileExtension = droppedFile.name.toLowerCase().substring(droppedFile.name.lastIndexOf("."))

      if (!allowedTypes.includes(fileExtension)) {
        setError("Invalid file type. Please select a .csv, .xlsx, or .xls file.")
        return
      }

      setFile(droppedFile)
      setError("")
      setSuccess("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload CSV/XLSX File
        </CardTitle>
        <CardDescription>
          Upload a file containing FirstName, Phone, and Notes columns. The data will be distributed equally among 5
          agents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Drop your file here or click to browse</p>
              <p className="text-sm text-muted-foreground">Supports .csv, .xlsx, and .xls files</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              Browse Files
            </Button>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing file...</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Distribute
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Required columns:</strong> FirstName, Phone, Notes
          </p>
          <p>
            <strong>Distribution:</strong> Items will be distributed equally among up to 5 agents
          </p>
          <p>
            <strong>File formats:</strong> CSV, XLSX, XLS
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

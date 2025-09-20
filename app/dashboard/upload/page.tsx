"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { FileUpload } from "@/components/FileUpload"
import { DistributionsList } from "@/components/DistributionsList"

export default function UploadPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    // Force refresh of distributions list
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">File Upload & Distribution</h1>
            <p className="text-muted-foreground mt-2">
              Upload CSV/XLSX files and distribute data among agents automatically
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <div key={refreshKey}>
              <DistributionsList />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

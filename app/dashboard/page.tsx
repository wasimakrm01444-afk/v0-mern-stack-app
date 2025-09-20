"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { DashboardStats } from "@/components/DashboardStats"
import { RecentActivity } from "@/components/RecentActivity"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.email}. Here's what's happening with your system.
            </p>
          </div>

          <DashboardStats />

          <div className="grid gap-8 md:grid-cols-2">
            <RecentActivity />
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a href="/dashboard/agents" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
                    <div className="font-medium">Add New Agent</div>
                    <div className="text-sm text-muted-foreground">Create a new agent account</div>
                  </a>
                  <a href="/dashboard/upload" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
                    <div className="font-medium">Upload File</div>
                    <div className="text-sm text-muted-foreground">Upload and distribute CSV/XLSX data</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

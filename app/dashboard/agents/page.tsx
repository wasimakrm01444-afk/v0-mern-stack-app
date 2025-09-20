"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { AddAgentForm } from "@/components/AddAgentForm"
import { AgentsList } from "@/components/AgentsList"

export default function AgentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAgentAdded = () => {
    // Force refresh of agents list
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Agent Management</h1>
            <p className="text-muted-foreground mt-2">Add new agents and manage existing ones</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AddAgentForm onAgentAdded={handleAgentAdded} />
            <div key={refreshKey}>
              <AgentsList />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

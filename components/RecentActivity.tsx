"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Upload, Calendar } from "lucide-react"

interface ActivityItem {
  id: string
  type: "upload" | "agent_added"
  description: string
  timestamp: string
  details?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent distributions
        const distributionsResponse = await fetch("/api/distributions", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const distributionsData = await distributionsResponse.json()

        // Fetch agents
        const agentsResponse = await fetch("/api/agents", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const agentsData = await agentsResponse.json()

        const activities: ActivityItem[] = []

        // Add distribution activities
        if (distributionsData.distributions) {
          const recentDistributions = distributionsData.distributions.slice(0, 5).map((dist: any) => ({
            id: dist._id,
            type: "upload" as const,
            description: `File distributed to ${dist.agentName}`,
            timestamp: dist.uploadDate,
            details: `${dist.totalItems} items`,
          }))
          activities.push(...recentDistributions)
        }

        // Add agent activities (simulate recent additions)
        if (agentsData.agents) {
          const recentAgents = agentsData.agents.slice(0, 3).map((agent: any) => ({
            id: agent._id,
            type: "agent_added" as const,
            description: `New agent ${agent.name} added`,
            timestamp: agent.createdAt,
            details: agent.email,
          }))
          activities.push(...recentAgents)
        }

        // Sort by timestamp and take the most recent
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setActivities(activities.slice(0, 8))
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      }
      setLoading(false)
    }

    if (token) {
      fetchRecentActivity()
    }
  }, [token])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload className="h-4 w-4" />
      case "agent_added":
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "upload":
        return "bg-green-100 text-green-800"
      case "agent_added":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest system activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No recent activity found</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                    {activity.details && (
                      <Badge variant="outline" className="text-xs">
                        {activity.details}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

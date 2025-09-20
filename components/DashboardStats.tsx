"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Upload, BarChart3, Calendar } from "lucide-react"

interface Stats {
  totalAgents: number
  totalDistributions: number
  totalItems: number
  recentUploads: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0,
    totalDistributions: 0,
    totalItems: 0,
    recentUploads: 0,
  })
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch agents
        const agentsResponse = await fetch("/api/agents", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const agentsData = await agentsResponse.json()

        // Fetch distributions
        const distributionsResponse = await fetch("/api/distributions", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const distributionsData = await distributionsResponse.json()

        const distributions = distributionsData.distributions || []
        const totalItems = distributions.reduce((sum: number, dist: any) => sum + dist.totalItems, 0)

        // Calculate recent uploads (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const recentUploads = distributions.filter((dist: any) => new Date(dist.uploadDate) > sevenDaysAgo).length

        setStats({
          totalAgents: agentsData.agents?.length || 0,
          totalDistributions: distributions.length,
          totalItems,
          recentUploads,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
      setLoading(false)
    }

    if (token) {
      fetchStats()
    }
  }, [token])

  const statCards = [
    {
      title: "Total Agents",
      value: stats.totalAgents,
      description: "Registered agents",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Distributions",
      value: stats.totalDistributions,
      description: "Files processed",
      icon: Upload,
      color: "text-green-600",
    },
    {
      title: "Total Items",
      value: stats.totalItems,
      description: "Data entries distributed",
      icon: BarChart3,
      color: "text-purple-600",
    },
    {
      title: "Recent Uploads",
      value: stats.recentUploads,
      description: "Last 7 days",
      icon: Calendar,
      color: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

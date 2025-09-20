"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Users, Calendar, ChevronDown, ChevronRight, Phone, FileText } from "lucide-react"

interface DistributedItem {
  firstName: string
  phone: string
  notes: string
}

interface Distribution {
  _id: string
  agentId: string
  agentName: string
  agentEmail: string
  items: DistributedItem[]
  totalItems: number
  uploadDate: string
}

export function DistributionsList() {
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { token } = useAuth()

  const fetchDistributions = async () => {
    try {
      const response = await fetch("/api/distributions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.distributions) {
        setDistributions(data.distributions)
      } else {
        setError(data.error || "Failed to fetch distributions")
      }
    } catch (error) {
      setError("Network error occurred")
    }

    setLoading(false)
  }

  useEffect(() => {
    if (token) {
      fetchDistributions()
    }
  }, [token])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const refreshDistributions = () => {
    setLoading(true)
    fetchDistributions()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  // Group distributions by upload date
  const groupedDistributions = distributions.reduce(
    (acc, dist) => {
      const date = new Date(dist.uploadDate).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(dist)
      return acc
    },
    {} as Record<string, Distribution[]>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Distributed Lists
        </CardTitle>
        <CardDescription>View how uploaded data has been distributed among agents</CardDescription>
      </CardHeader>
      <CardContent>
        {distributions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No distributions found. Upload a file to see distributions here.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDistributions).map(([date, dateDistributions]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {date}
                </div>

                <div className="grid gap-4">
                  {dateDistributions.map((distribution) => (
                    <Collapsible key={distribution._id}>
                      <Card className="border-2">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {expandedItems.has(distribution._id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <div>
                                  <CardTitle className="text-lg">{distribution.agentName}</CardTitle>
                                  <CardDescription>{distribution.agentEmail}</CardDescription>
                                </div>
                              </div>
                              <Badge variant="secondary">{distribution.totalItems} items</Badge>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-muted-foreground">Assigned Items:</div>
                              <div className="grid gap-2 max-h-60 overflow-y-auto">
                                {distribution.items.map((item, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg text-sm">
                                    <div className="flex-1">
                                      <div className="font-medium">{item.firstName}</div>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        {item.phone}
                                      </div>
                                    </div>
                                    {item.notes && (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <FileText className="h-3 w-3" />
                                        <span className="text-xs truncate max-w-32" title={item.notes}>
                                          {item.notes}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const iconBySeverity: Record<string, any> = {
  INFO: CheckCircle,
  WARNING: AlertTriangle,
  CRITICAL: AlertTriangle,
}

export function RecentActivity({ activities = [] }: { activities?: any[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Hoat dong gan day</CardTitle>
        <CardDescription className="text-muted-foreground">
          Lay tu audit log backend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = iconBySeverity[activity.severity] || FileText
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className={activity.severity === "CRITICAL" ? "mt-0.5 text-destructive" : "mt-0.5 text-primary"}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.message || activity.type}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.time ? new Date(activity.time).toLocaleString("vi-VN") : "N/A"}
                    </p>
                  </div>
                </div>
              )
            })}
            {!activities.length && <p className="text-sm text-muted-foreground">Chua co audit log.</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

import { AlertTriangle, Lock, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResolveSecurityIncident, useSecurityIncidents } from "@/modules/violations/api/moderation";

export function SecuritySettings() {
  const { data: incidents = [], isLoading, isError } = useSecurityIncidents();
  const resolveIncident = useResolveSecurityIncident();
  const openIncidents = incidents.filter((incident) => incident.status === "OPEN");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Lock className="h-5 w-5" />
          Bảo mật
        </CardTitle>
        <CardDescription>Dữ liệu lấy từ API sự cố bảo mật.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Incident đang mở" value={openIncidents.length} />
          <Metric label="Tổng sự cố" value={incidents.length} />
          <Metric label="Trạng thái API" value={isError ? "Lỗi" : isLoading ? "Đang tải" : "OK"} />
        </div>

        <div className="space-y-3">
          {openIncidents.slice(0, 5).map((incident) => (
            <div key={incident.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Sự cố #{incident.id}</p>
                  <p className="text-sm text-muted-foreground">{incident.reason}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">{incident.severity}</Badge>
                    <Badge variant="secondary">User #{incident.userId}</Badge>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={resolveIncident.isPending}
                onClick={() => resolveIncident.mutate({ id: incident.id })}
              >
                <ShieldCheck className="h-4 w-4" />
                Đã xử lý
              </Button>
            </div>
          ))}
          {!openIncidents.length && (
            <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Không có sự cố bảo mật đang mở.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

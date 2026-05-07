import { Badge } from "@/components/ui/badge";

export function ProductStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <Badge className="bg-success text-success-foreground">Da duyet</Badge>;
    case "pending":
      return <Badge className="bg-warning text-warning-foreground">Cho duyet</Badge>;
    case "rejected":
      return <Badge className="bg-destructive text-destructive-foreground">Tu choi</Badge>;
    case "banned":
      return <Badge className="bg-red-700 text-white">Cam ban</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}

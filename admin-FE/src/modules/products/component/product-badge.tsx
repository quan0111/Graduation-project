import { Badge } from "@/components/ui/badge";

export function ProductStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <Badge className="bg-success text-success-foreground">Đã duyệt</Badge>;
    case "pending":
      return <Badge className="bg-warning text-warning-foreground">Chờ duyệt</Badge>;
    case "rejected":
      return <Badge className="bg-destructive text-destructive-foreground">Từ chối</Badge>;
    case "banned":
      return <Badge className="bg-red-700 text-white">Cấm bán</Badge>;
    default:
      return <Badge>Không rõ</Badge>;
  }
}

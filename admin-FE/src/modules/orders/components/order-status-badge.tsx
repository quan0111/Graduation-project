import { Badge } from "@/components/ui/badge";

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Đã giao": "bg-success/10 text-success border-success/20",
    "Đang giao": "bg-primary/10 text-primary border-primary/20",
    "Chưa thanh toán": "bg-warning/10 text-warning border-warning/20",
    "Đã hủy": "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}
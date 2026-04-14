import { Badge } from "@/components/ui/badge";

export function ReviewBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "Đã duyệt"
          ? "bg-success/10 text-success border-success/20"
          : "bg-warning/10 text-warning border-warning/20"
      }
    >
      {status}
    </Badge>
  );
}
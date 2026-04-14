import { Badge } from "@/components/ui/badge";

type Props = {
  status: "active" | "pending" | "suspended";
};

export function ShopBadge({ status }: Props) {
  switch (status) {
    case "active":
      return <Badge className="bg-success text-success-foreground">Hoạt động</Badge>;
    case "pending":
      return <Badge className="bg-warning text-warning-foreground">Chờ duyệt</Badge>;
    case "suspended":
      return <Badge className="bg-destructive text-destructive-foreground">Tạm khóa</Badge>;
    default:
      return <Badge>Không rõ</Badge>;
  }
}
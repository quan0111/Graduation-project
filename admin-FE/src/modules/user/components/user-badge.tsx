import { Badge } from "@/components/ui/badge";

export const RoleBadge = ({ role }: { role: string }) => {
  return role === "seller" ? (
    <Badge className="bg-primary text-primary-foreground">Người bán</Badge>
  ) : (
    <Badge className="bg-accent text-accent-foreground">Người mua</Badge>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success text-success-foreground">Hoạt động</Badge>;
    case "inactive":
      return <Badge className="bg-muted text-muted-foreground">Không hoạt động</Badge>;
    case "suspended":
      return <Badge className="bg-destructive text-destructive-foreground">Bị khóa</Badge>;
    default:
      return <Badge>Chưa xác định</Badge>;
  }
};
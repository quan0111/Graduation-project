import { Badge } from "@/components/ui/badge";

export const RoleBadge = ({ role }: { role: string }) => {
  if (role === "admin") {
    return <Badge className="bg-purple-600 text-white">Admin</Badge>;
  }
  if (role === "seller") {
    return <Badge className="bg-primary text-primary-foreground">Người bán</Badge>
  }
  return <Badge className="bg-accent text-accent-foreground">Người mua</Badge>
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
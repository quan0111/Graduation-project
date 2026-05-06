import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Label } from "@/components/ui/label";
export function AdminManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Users className="w-5 h-5" />
          Quản lý Admin
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div className="flex justify-between m-2">
          <span>admin@ecommerce.vn</span>
          <Badge>Super Admin</Badge>
        </div>
        
        <div className="flex justify-between m-2">
          <span>admin@ecommerce.vn</span>
          <Badge>Admin</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
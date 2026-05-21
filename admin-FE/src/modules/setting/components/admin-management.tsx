import { Link } from "react-router-dom";
import { ArrowRight, Crown, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAccounts } from "@/modules/admin/api/admin-users";

export function AdminManagement() {
  const { data: adminAccounts = [] } = useAdminAccounts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Quản lý Admin
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          {adminAccounts.length} tai khoan admin dang duoc kich hoat trong he thong.
        </div>

        <div className="space-y-3">
          {adminAccounts.slice(0, 4).map((account) => (
            <div key={account.id} className="flex items-center justify-between rounded-2xl border border-border/70 p-3">
              <div>
                <p className="font-medium text-foreground">{account.fullName || account.email}</p>
                <p className="text-xs text-muted-foreground">{account.email}</p>
              </div>
              <Badge className="gap-1">
                <Crown className="size-3" />
                {account.role}
              </Badge>
            </div>
          ))}
        </div>

        <Link to="/profile">
          <Button variant="outline" className="gap-2">
            Mo profile admin
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

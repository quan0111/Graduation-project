import { Bell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <main className="flex-1 overflow-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Thông báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Route thông báo admin đã sẵn sàng. Kết nối API realtime/admin notification sẽ dùng chung module notifications khi backend bổ sung danh sách cho admin.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

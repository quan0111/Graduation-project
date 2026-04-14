import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Save } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export function SecuritySettings() {
  const [twoFA, setTwoFA] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Lock className="w-5 h-5" />
          Bảo mật
        </CardTitle>
        <CardDescription>Quản lý bảo mật</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Label className="text-sm font-medium leading-none">Xác thực 2 yếu tố (2FA)</Label>
        <Switch checked={twoFA} onCheckedChange={setTwoFA} />
        <Label className="text-sm font-medium leading-none">Chế độ bảo trì</Label>
        <Switch checked={maintenance} onCheckedChange={setMaintenance} />
        <Label className="text-sm font-medium leading-none">Đổi mật khẩu</Label>
        <Input type="password" placeholder="Mật khẩu mới" />

        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Cập nhật
        </Button>
      </CardContent>
    </Card>
  );
}
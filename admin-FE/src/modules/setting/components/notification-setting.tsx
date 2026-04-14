import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export function NotificationSettings() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Bell className="w-5 h-5" />
          Thông báo
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Label className="text-sm font-medium leading-none">Thông báo qua Email</Label>
        <Switch checked={email} onCheckedChange={setEmail} />
        <Label className="text-sm font-medium leading-none">Thông báo qua Push</Label>
        <Switch checked={push} onCheckedChange={setPush} />
      </CardContent>
    </Card>
  );
}
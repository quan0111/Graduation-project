import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Zap } from "lucide-react";

export function GeneralSettings() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Cài đặt Chung
        </CardTitle>
        <CardDescription>Các cài đặt chung của nền tảng</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Label>Tên </Label>
        <Input defaultValue="E-Commerce Platform" />
        <Label>Email hỗ trợ</Label>
        <Input type="email" defaultValue="admin@ecommerce.vn" />
        <Label>Số điện thoại</Label>
        <Input defaultValue="0800-123-456" />
        <Label>Địa chỉ</Label>
        <Input defaultValue="123 Đường ABC, Quận 1, TP.HCM" />
        <Label>Múi giờ</Label>
        <Select defaultValue="asia-ho-chi-minh">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="asia-ho-chi-minh">GMT+7</SelectItem>
          </SelectContent>
        </Select>

        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </Button>
      </CardContent>
    </Card>
  );
}
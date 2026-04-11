'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Save, Bell, Lock, Users, Zap, Database } from 'lucide-react';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
        <main className="flex-1 overflow-auto p-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Cài đặt Hệ thống</h1>
            <p className="text-muted-foreground">Quản lý cài đặt chung và bảo mật của hệ thống</p>
          </div>

          <div className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Cài đặt Chung
                </CardTitle>
                <CardDescription>Các cài đặt chung của nền tảng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tên nền tảng</label>
                  <Input defaultValue="E-Commerce Platform" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email liên hệ</label>
                  <Input type="email" defaultValue="admin@ecommerce.vn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại hỗ trợ</label>
                  <Input defaultValue="0800-123-456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Múi giờ</label>
                  <Select defaultValue="asia-ho-chi-minh">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-ho-chi-minh">GMT+7 (Hồ Chí Minh)</SelectItem>
                      <SelectItem value="asia-bangkok">GMT+7 (Bangkok)</SelectItem>
                      <SelectItem value="asia-jakarta">GMT+7 (Jakarta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ngôn ngữ mặc định</label>
                  <Select defaultValue="vi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Bảo mật
                </CardTitle>
                <CardDescription>Quản lý bảo mật và xác thực</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Xác thực hai bước (2FA)</p>
                    <p className="text-sm text-muted-foreground">Thêm lớp bảo mật cho tài khoản admin</p>
                  </div>
                  <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Chế độ bảo trì</p>
                    <p className="text-sm text-muted-foreground">Tắt truy cập công khai trong khi bảo trì</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu hiện tại</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu mới</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Xác nhận mật khẩu</label>
                  <Input type="password" />
                </div>
                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Cập nhật bảo mật
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Thông báo
                </CardTitle>
                <CardDescription>Quản lý các thông báo của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Thông báo email</p>
                    <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Thông báo push</p>
                    <p className="text-sm text-muted-foreground">Nhận thông báo push trên trình duyệt</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Loại thông báo:</strong> Shop chờ duyệt, Sản phẩm chờ duyệt, Báo cáo vi phạm, Ticket hỗ trợ mới
                  </p>
                </div>

                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Lưu cài đặt thông báo
                </Button>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Quản lý Admin
                </CardTitle>
                <CardDescription>Thêm hoặc xóa quản trị viên hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card border border-border p-4 rounded-lg mb-4">
                  <p className="font-medium text-foreground mb-2">Quản trị viên hiện tại</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-foreground">admin@ecommerce.vn</span>
                      <Badge className="bg-primary text-primary-foreground">Super Admin</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-foreground">moderator1@ecommerce.vn</span>
                      <Badge className="bg-accent text-accent-foreground">Moderator</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Thêm quản trị viên mới</label>
                  <div className="flex gap-2">
                    <Input placeholder="Email quản trị viên mới" />
                    <Button>Thêm</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Cơ sở dữ liệu
                </CardTitle>
                <CardDescription>Quản lý và sao lưu cơ sở dữ liệu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Trạng thái:</strong> <span className="text-success">Bình thường</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Kích thước:</strong> 2.4 GB / 10 GB
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">Sao lưu dữ liệu</Button>
                  <Button variant="outline">Tối ưu hóa CSDL</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
  );
}

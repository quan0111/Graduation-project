'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Pencil, Save, LogOut } from "lucide-react";

export default function AdminProfilePage() {
  const [isEdit, setIsEdit] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    const updated = { ...user, ...form };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setIsEdit(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/admin/login";
  };

  if (!user) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>

        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>

      <Separator />

      {/* PROFILE CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>

          {/* FORM */}
          <div className="grid gap-4">

            <div>
              <Label>Họ tên</Label>
              <Input
                disabled={!isEdit}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                disabled
                value={form.email}
              />
            </div>

          </div>

          {/* ACTION */}
          <div className="flex gap-2">
            {!isEdit ? (
              <Button onClick={() => setIsEdit(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            ) : (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Lưu
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

      {/* SECURITY */}
      <Card>
        <CardHeader>
          <CardTitle>Bảo mật</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button variant="outline">
            Đổi mật khẩu
          </Button>

          <Button variant="outline">
            Bật 2FA (coming soon)
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
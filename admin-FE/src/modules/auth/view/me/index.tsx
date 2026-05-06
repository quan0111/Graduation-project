'use client';

import { useState } from "react";
import { LogOut, Pencil, Save } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  clearAdminSession,
  getStoredAdminUser,
  setStoredAdminUser,
} from "@/lib/auth-storage";

type AdminProfile = {
  id: number | string;
  fullName?: string;
  email: string;
  role: string;
};

export default function AdminProfilePage() {
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState<AdminProfile | null>(() => getStoredAdminUser<AdminProfile>());
  const [form, setForm] = useState(() => ({
    name: getStoredAdminUser<AdminProfile>()?.fullName || "",
    email: getStoredAdminUser<AdminProfile>()?.email || "",
  }));

  const handleSave = () => {
    if (!user) {
      return;
    }

    const updated = { ...user, fullName: form.name, email: form.email };
    setStoredAdminUser(updated);
    setUser(updated);
    setIsEdit(false);
  };

  const handleLogout = () => {
    clearAdminSession();
    window.location.href = "/admin/login";
  };

  if (!user) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Thong tin tai khoan</h1>

        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Dang xuat
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Thong tin ca nhan</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                {user.fullName?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-medium">{user.fullName}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label>Ho ten</Label>
              <Input
                disabled={!isEdit}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input disabled value={form.email} />
            </div>
          </div>

          <div className="flex gap-2">
            {!isEdit ? (
              <Button onClick={() => setIsEdit(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chinh sua
              </Button>
            ) : (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Luu
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bao mat</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button variant="outline">Doi mat khau</Button>
          <Button variant="outline">Bat 2FA (coming soon)</Button>
        </CardContent>
      </Card>
    </div>
  );
}

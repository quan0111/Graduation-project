'use client';

import { useState } from "react";
import { useLogin } from "../api/login";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { Eye, EyeOff, Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const loginMutation = useLogin({
    config: {
      onSuccess: (data) => {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          navigate("/");
        }, 50);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(form);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-black via-gray-900 to-gray-800 p-10 text-white">
        <div>
          <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
          <p className="text-gray-400">
            Quản lý hệ thống e-commerce của bạn một cách thông minh.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="text-blue-500" />
            <span>Bảo mật cao</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-blue-500" />
            <span>Quản lý đơn hàng & sản phẩm</span>
          </div>
        </div>

        <p className="text-sm text-gray-500">© 2026 Admin System</p>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardContent className="p-8">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Shield className="text-white" size={20} />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Admin Login</h2>
              <p className="text-gray-500 text-sm">
                Đăng nhập để tiếp tục
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={remember}
                    onCheckedChange={(val: any) => setRemember(val)}
                  />
                  <span>Remember me</span>
                </div>

                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Error */}
              {loginMutation.isError && (
                <p className="text-red-500 text-sm">
                  {(loginMutation.error as any)?.message ||
                    "Sai tài khoản hoặc không phải admin"}
                </p>
              )}

              {/* Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Đăng nhập
              </Button>

            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useCreateAddress } from "../../api/add-address";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CreateAddressPage() {
  const navigate = useNavigate();
  const createMutation = useCreateAddress();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    ward: "",
    district: "",
    province: "",
    postal_code: "",
    is_default: false,
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync(form);

      toast.success("Thêm địa chỉ thành công 🚀");

      navigate("/addresses");
    } catch (err) {
      console.error(err);
      toast.error("Thêm địa chỉ thất bại");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Thêm địa chỉ mới
          </CardTitle>
        </CardHeader>

        <Separator />

        <CardContent className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* FULL NAME */}
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input
                value={form.full_name}
                onChange={(e) =>
                  handleChange("full_name", e.target.value)
                }
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value)
                }
                placeholder="090xxxxxxx"
                required
              />
            </div>

            {/* ADDRESS */}
            <div className="space-y-2">
              <Label>Địa chỉ cụ thể</Label>
              <Input
                value={form.address_line}
                onChange={(e) =>
                  handleChange("address_line", e.target.value)
                }
                placeholder="Số nhà, tên đường..."
                required
              />
            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Phường / Xã</Label>
                <Input
                  value={form.ward}
                  onChange={(e) =>
                    handleChange("ward", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Quận / Huyện</Label>
                <Input
                  value={form.district}
                  onChange={(e) =>
                    handleChange("district", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tỉnh / Thành phố</Label>
                <Input
                  value={form.province}
                  onChange={(e) =>
                    handleChange("province", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Mã bưu điện</Label>
                <Input
                  value={form.postal_code}
                  onChange={(e) =>
                    handleChange("postal_code", e.target.value)
                  }
                />
              </div>
            </div>

            {/* DEFAULT */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.is_default}
                onCheckedChange={(v) =>
                  handleChange("is_default", v)
                }
              />
              <Label>Đặt làm địa chỉ mặc định</Label>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? "Đang lưu..."
                : "Lưu địa chỉ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
// PasswordTab.tsx

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NoticeDialog } from "@/components/common/app-dialog";
import { useChangePassword } from "../api/change-password";
import { toast } from "sonner";

type FormState = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const PasswordTab: React.FC = () => {
  const changePasswordMutation = useChangePassword();
  const [form, setForm] = useState<FormState>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notice, setNotice] = useState("");

  const handleChange = (
    key: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword) {
      setNotice("Vui lòng nhập đầy đủ");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setNotice("Mật khẩu không khớp");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      toast.success("Đã cập nhật mật khẩu");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể cập nhật mật khẩu");
    }
  };

  return (
    <>
      <div className="space-y-4 max-w-md">
      <Input
        type="password"
        placeholder="Mật khẩu cũ"
        value={form.oldPassword}
        onChange={(e) =>
          handleChange("oldPassword", e.target.value)
        }
      />

      <Input
        type="password"
        placeholder="Mật khẩu mới"
        value={form.newPassword}
        onChange={(e) =>
          handleChange("newPassword", e.target.value)
        }
      />

      <Input
        type="password"
        placeholder="Xác nhận"
        value={form.confirmPassword}
        onChange={(e) =>
          handleChange("confirmPassword", e.target.value)
        }
      />

      <Button onClick={handleSubmit} disabled={changePasswordMutation.isPending}>
        {changePasswordMutation.isPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </Button>
      </div>

      <NoticeDialog
        open={Boolean(notice)}
        title="Kiểm tra thông tin"
        description={notice}
        onOpenChange={(open) => !open && setNotice("")}
      />
    </>
  );
};

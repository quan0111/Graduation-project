// PasswordTab.tsx

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormState = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const PasswordTab: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (
    key: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.oldPassword || !form.newPassword) {
      alert("Vui lòng nhập đầy đủ");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    // TODO: call API
    console.log("Change password:", form);
  };

  return (
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

      <Button onClick={handleSubmit}>
        Cập nhật mật khẩu
      </Button>
    </div>
  );
};
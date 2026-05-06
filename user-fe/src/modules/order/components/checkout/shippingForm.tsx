'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import clsx from "clsx";

import { useCreateAddress } from "@/modules/address/api/add-address";

type Props = {
  addresses: any[];
  onNext: (address: any) => void;
};

export const ShippingForm = ({ addresses, onNext }: Props) => {
  const [mode, setMode] = useState<"select" | "new">("select");

  const [selectedId, setSelectedId] = useState<number | null>(
    addresses?.find((a) => a.is_default)?.id || null
  );

  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    ward: "",
    district: "",
    province: "",
  });

  const createAddressMutation = useCreateAddress();

  const handleSubmit = async () => {
    if (mode === "select") {
      const address = addresses.find((a) => a.id === selectedId);
      if (!address) {
        toast.error("Chọn địa chỉ");
        return;
      }

      onNext(address);
    } else {
      if (
        !newAddress.full_name ||
        !newAddress.phone ||
        !newAddress.address_line ||
        !newAddress.district ||
        !newAddress.province
      ) {
        toast.error("Nhập đầy đủ thông tin");
        return;
      }

      try {
        const created = await createAddressMutation.mutateAsync({
          ...newAddress,
          is_default: false,
        });

        toast.success("Thêm địa chỉ thành công");
        onNext(created);

      } catch (err) {
        console.error(err);
        toast.error("Tạo địa chỉ thất bại");
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= MODE ================= */}
      <RadioGroup
        value={mode}
        onValueChange={(v) => setMode(v as any)}
        className="flex gap-4"
      >

        <div
          onClick={() => setMode("select")}
          className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all w-full",
            "hover:border-primary hover:shadow-sm",
            mode === "select"
              ? "border-primary bg-primary/5 shadow"
              : "border-gray-300"
          )}
        >
          <RadioGroupItem
            value="select"
            id="select"
            className="border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <Label htmlFor="select" className="cursor-pointer">
            Địa chỉ đã lưu
          </Label>
        </div>

        {/* NEW MODE */}
        <div
          onClick={() => setMode("new")}
          className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all w-full",
            "hover:border-primary hover:shadow-sm",
            mode === "new"
              ? "border-primary bg-primary/5 shadow"
              : "border-gray-300"
          )}
        >
          <RadioGroupItem
            value="new"
            id="new"
            className="border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <Label htmlFor="new" className="cursor-pointer">
            Nhập địa chỉ mới
          </Label>
        </div>

      </RadioGroup>

      {mode === "select" && (
        <div className="space-y-3">
          {addresses?.map((a) => {
            const active = selectedId === a.id;

            return (
              <div
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={clsx(
                  "p-4 border rounded-xl cursor-pointer transition-all",
                  "hover:border-primary hover:shadow-sm dis",
                  active
                    ? "border-primary bg-primary/5 shadow"
                    : "border-gray-200"
                )}
              >
                <div className="flex items-center gap-4 justify-between">
                  <div>
                    <p className="font-semibold">{a.full_name}</p>
                    <p className="text-sm">{a.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.address_line}, {a.district}, {a.province}
                    </p>

                    {a.is_default && (
                      <span className="text-xs text-green-600 font-medium">
                        Mặc định
                      </span>
                    )}
                  </div>

                  {active && (
                    <CheckCircle2 className="text-primary" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === "new" && (
        <div className="space-y-3 bg-muted/30 p-4 rounded-xl">
          <Input
            placeholder="Họ tên"
            onChange={(e) =>
              setNewAddress({ ...newAddress, full_name: e.target.value })
            }
          />

          <Input
            placeholder="Số điện thoại"
            onChange={(e) =>
              setNewAddress({ ...newAddress, phone: e.target.value })
            }
          />

          <Input
            placeholder="Địa chỉ cụ thể"
            onChange={(e) =>
              setNewAddress({
                ...newAddress,
                address_line: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Quận/Huyện"
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  district: e.target.value,
                })
              }
            />

            <Input
              placeholder="Tỉnh/Thành"
              onChange={(e) =>
                setNewAddress({
                  ...newAddress,
                  province: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      {/* BUTTON */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={createAddressMutation.isPending}
      >
        {createAddressMutation.isPending
          ? "Đang xử lý..."
          : "Tiếp tục"}
      </Button>
    </div>
  );
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Field } from "./field";
import type { ShippingDraft } from "../../types/addproduct";

type Props = {
  shipping: ShippingDraft;
  onShippingChange: (updater: (current: ShippingDraft) => ShippingDraft) => void;
};

export function ShippingStep({ shipping, onShippingChange }: Props) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>Thông tin vận chuyển</CardTitle>
        <CardDescription>
          Phần này tạm thời để thông tin cơ bản. Khi backend shipping hoàn thiện hơn, có thể nối tiếp vào bảng cấu hình riêng.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Lưu ý khi nhập thông tin vận chuyển:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Các thông số kích thước (dài, rộng, cao) nên được đo bằng cm và chỉ nhập số.</li>
              <li>Cân nặng nên được nhập bằng kg, có thể có phần thập phân (ví dụ: 0.5).</li>
              <li>Ghi chú vận chuyển có thể bao gồm các yêu cầu đặc biệt như "hàng dễ vỡ" hoặc "giao nhanh".</li>
            </ul>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Dài (cm)">
            <Input
              value={shipping.packageLength}
              onChange={(event) =>
                onShippingChange((current) => ({ ...current, packageLength: event.target.value }))
              }
              placeholder="30"
            />
          </Field>

          <Field label="Rộng (cm)">
            <Input
              value={shipping.packageWidth}
              onChange={(event) =>
                onShippingChange((current) => ({ ...current, packageWidth: event.target.value }))
              }
              placeholder="20"
            />
          </Field>

          <Field label="Cao (cm)">
            <Input
              value={shipping.packageHeight}
              onChange={(event) =>
                onShippingChange((current) => ({ ...current, packageHeight: event.target.value }))
              }
              placeholder="10"
            />
          </Field>

          <Field label="Cân nặng (kg)">
            <Input
              value={shipping.packageWeight}
              onChange={(event) =>
                onShippingChange((current) => ({ ...current, packageWeight: event.target.value }))
              }
              placeholder="0.5"
            />
          </Field>
        </div>

        <Field label="Ghi chú vận chuyển">
          <Textarea
            value={shipping.shippingNote}
            onChange={(event) =>
              onShippingChange((current) => ({ ...current, shippingNote: event.target.value }))
            }
            placeholder="Ví dụ: hàng dễ vỡ, giao nhanh..."
          />
        </Field>
      </CardContent>
    </Card>
  );
}
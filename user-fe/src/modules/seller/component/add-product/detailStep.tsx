import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Field } from "./field";
import { ValidationList } from "./validationList";
import type { AttributeRow } from "../../types/addproduct";

type Props = {
  attributes: AttributeRow[];
  description: string;
  detailErrors: string[];
  onUpdateAttribute: (index: number, field: keyof AttributeRow, value: string) => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
  onDescriptionChange: (value: string) => void;
};

export function DetailStep({
  attributes,
  description,
  detailErrors,
  onUpdateAttribute,
  onAddAttribute,
  onRemoveAttribute,
  onDescriptionChange,
}: Props) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>Thông tin chi tiết và mô tả</CardTitle>
        <CardDescription>
          Phần này dùng cho các thuộc tính sản phẩm như chất liệu, thương hiệu, xuất xứ... Sau đó nhập mô tả đầy đủ.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {attributes.map((attribute, index) => (
            <div key={`${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input
                value={attribute.key}
                onChange={(event) => onUpdateAttribute(index, "key", event.target.value)}
                placeholder="Thuộc tính: Thương hiệu"
              />
              <Input
                value={attribute.value}
                onChange={(event) => onUpdateAttribute(index, "value", event.target.value)}
                placeholder="Giá trị: Local Brand"
              />
              <Button variant="ghost" onClick={() => onRemoveAttribute(index)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={onAddAttribute}>
            Thêm thuộc tính
          </Button>
        </div>

        <Field label="Mô tả sản phẩm">
          <Textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className="min-h-52"
            placeholder="Mô tả nổi bật, chất liệu, đối tượng sử dụng, hướng dẫn bảo quản..."
          />
        </Field>

        <ValidationList errors={detailErrors} />
      </CardContent>
    </Card>
  );
}
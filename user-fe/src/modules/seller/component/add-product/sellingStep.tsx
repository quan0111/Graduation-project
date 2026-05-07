import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { ValidationList } from "./validationList";
import { VariantTable } from "./variantTable";
import type { UploadedImage, VariantDraft, VariantGroup } from "../../types/addproduct";

type Props = {
  variantGroups: VariantGroup[];
  variants: VariantDraft[];
  images: UploadedImage[];
  sellingErrors: string[];
  onUpdateGroupName: (index: number, value: string) => void;
  onUpdateGroupValue: (groupIndex: number, valueIndex: number, value: string) => void;
  onAddGroup: () => void;
  onAddGroupValue: (groupIndex: number) => void;
  onRemoveGroup: (groupIndex: number) => void;
  onRemoveGroupValue: (groupIndex: number, valueIndex: number) => void;
  onGenerateVariants: () => void;
  onUpdateVariant: (index: number, field: keyof VariantDraft, value: string | number) => void;
};

export function SellingStep({
  variantGroups,
  variants,
  images,
  sellingErrors,
  onUpdateGroupName,
  onUpdateGroupValue,
  onAddGroup,
  onAddGroupValue,
  onRemoveGroup,
  onRemoveGroupValue,
  onGenerateVariants,
  onUpdateVariant,
}: Props) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>Thông tin bán hàng và phân loại</CardTitle>
        <CardDescription>
          Tạo các nhóm phân loại như màu sắc, kích thước, giới tính... Sau đó thêm các giá trị tương ứng. Cuối cùng nhấn "Tạo bảng phân loại" để hệ thống tự động sinh ra các biến thể sản phẩm.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {variantGroups.map((group, groupIndex) => (
            <div key={`${groupIndex}`} className="rounded-[24px] border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Input
                  value={group.name}
                  onChange={(event) => onUpdateGroupName(groupIndex, event.target.value)}
                  placeholder="Tên nhóm phân loại: Màu sắc, kích thước, giới tính..."
                />
                <Button variant="ghost" onClick={() => onRemoveGroup(groupIndex)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {group.values.map((value, valueIndex) => (
                  <div key={`${valueIndex}`} className="flex gap-2">
                    <Input
                      value={value}
                      onChange={(event) => onUpdateGroupValue(groupIndex, valueIndex, event.target.value)}
                      placeholder="Giá trị: đen, trắng, xám.."
                    />
                    <Button variant="ghost" onClick={() => onRemoveGroupValue(groupIndex, valueIndex)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Button variant="outline" onClick={() => onAddGroupValue(groupIndex)}>
                  Thêm giá trị cho nhóm
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onAddGroup}>
              Thêm nhóm phân loại
            </Button>
            <Button onClick={onGenerateVariants}>Tạo bảng phân loại</Button>
          </div>
        </div>

        <VariantTable
          variants={variants}
          images={images}
          updateVariant={onUpdateVariant}
        />

        <ValidationList errors={sellingErrors} />
      </CardContent>
    </Card>
  );
}
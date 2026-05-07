import { useState } from "react";
import { RotateCcw, X, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCreateReturnRequest } from "../api/create-return";
import type { ReturnRequestCreatePayload } from "../api/create-return";

interface ReturnRequestFormProps {
  orderId: number;
  orderItems: any[];
  onCancel: () => void;
  onSuccess: () => void;
}

export const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({
  orderId,
  orderItems,
  onCancel,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const createMutation = useCreateReturnRequest();

  const handleItemQuantityChange = (itemId: number, quantity: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: quantity,
    }));
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setEvidenceUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do trả hàng");
      return;
    }

    if (Object.keys(selectedItems).length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    try {
      const payload: ReturnRequestCreatePayload = {
        orderId,
        reason,
        items: Object.entries(selectedItems).map(([itemId, quantity]) => ({
          orderItemId: Number(itemId),
          quantity,
        })),
        evidences: evidenceUrls.map((imageUrl) => ({ imageUrl })),
      };

      await createMutation.mutateAsync(payload);

      toast.success("Yêu cầu trả hàng đã được gửi");
      onSuccess();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Không thể gửi yêu cầu trả hàng");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Yêu cầu trả hàng</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Reason */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Lý do trả hàng</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do trả hàng..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Select Items */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Chọn sản phẩm trả</label>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <input
                    type="checkbox"
                    checked={selectedItems[item.id] !== undefined}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems((prev) => ({ ...prev, [item.id]: 1 }));
                      } else {
                        setSelectedItems((prev) => {
                          const updated = { ...prev };
                          delete updated[item.id];
                          return updated;
                        });
                      }
                    }}
                    className="size-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">Số lượng: {item.quantity}</p>
                  </div>
                  {selectedItems[item.id] !== undefined && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (selectedItems[item.id] > 1) {
                            handleItemQuantityChange(item.id, selectedItems[item.id] - 1);
                          }
                        }}
                        className="size-6 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{selectedItems[item.id]}</span>
                      <button
                        onClick={() => {
                          if (selectedItems[item.id] < item.quantity) {
                            handleItemQuantityChange(item.id, selectedItems[item.id] + 1);
                          }
                        }}
                        className="size-6 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Bằng chứng (link ảnh)</label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Nhập URL ảnh..."
                className="flex-1"
              />
              <Button onClick={handleAddImageUrl} variant="outline" size="icon">
                <Upload className="size-4" />
              </Button>
            </div>
            {evidenceUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {evidenceUrls.map((url, index) => (
                  <div key={index} className="group relative">
                    <img src={url} alt={`Evidence ${index + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                    <button
                      onClick={() => handleRemoveImageUrl(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button onClick={onCancel} variant="outline">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#ee4d2d] hover:bg-[#d93f21]"
              disabled={createMutation.isPending}
            >
              <RotateCcw className="mr-2 size-4" />
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

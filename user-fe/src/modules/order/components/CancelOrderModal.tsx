import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCancelOrder } from "../api/cancel-order";
import { toast } from "sonner";

interface CancelOrderModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelOrderModal = ({ orderId, isOpen, onClose, onSuccess }: CancelOrderModalProps) => {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const cancelMutation = useCancelOrder();

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        orderId,
        reason: reason.trim(),
        note: note.trim() || undefined,
      });
      toast.success("Hủy đơn hàng thành công");
      onSuccess();
    } catch (error) {
      toast.error("Không thể hủy đơn hàng");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Hủy đơn hàng</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Lý do hủy *</Label>
            <Input
              id="reason"
              placeholder="Nhập lý do hủy đơn hàng"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
            <Input
              id="note"
              placeholder="Thêm ghi chú nếu cần"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={cancelMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCancel}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

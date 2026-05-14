import { useState } from "react";
import { ShieldAlert, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";

import { useSellerModerationCases, useSubmitProductAppeal } from "../../api/moderation/cases";

export default function SellerViolationsPage() {
  const { data: cases = [], isLoading } = useSellerModerationCases();
  const appealMutation = useSubmitProductAppeal();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [evidenceUrls, setEvidenceUrls] = useState<Record<number, string>>({});

  const submitAppeal = async (productId: number) => {
    const sellerNote = notes[productId]?.trim();
    if (!sellerNote) {
      toast.error("Bạn cần nhập giải trình trước khi gửi");
      return;
    }

    try {
      await appealMutation.mutateAsync({
        productId,
        sellerNote,
        evidenceUrl: evidenceUrls[productId],
      });
      toast.success("Đã gửi giải trình cho admin");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể gửi giải trình");
    }
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-orange-100 text-[#ee4d2d]">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">Sản phẩm bị xử lý</h1>
              <p className="text-sm text-slate-500">Gửi bằng chứng hoặc giải trình nếu bạn cho rằng sản phẩm không vi phạm.</p>
            </div>
          </div>
        </div>

        {isLoading ? <p className="text-sm text-slate-500">Đang tải hồ sơ vi phạm...</p> : null}
        {!isLoading && !cases.length ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-950">Chưa có sản phẩm vi phạm</p>
            <p className="mt-2 text-sm text-slate-500">Các hồ sơ cần giải trình sẽ xuất hiện tại đây.</p>
          </div>
        ) : null}

        <div className="space-y-4">
          {cases.map((item) => (
            <article key={item.id} className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{item.product?.name || `Sản phẩm #${item.productId}`}</p>
                  <p className="mt-1 text-sm text-slate-500">Trạng thái hồ sơ: {item.status}</p>
                  <p className="mt-3 text-sm text-slate-700">Lý do admin: {item.reason}</p>
                  {item.adminNote ? <p className="mt-2 text-sm text-slate-500">Ghi chú: {item.adminNote}</p> : null}
                  {item.sellerNote ? <p className="mt-3 text-sm text-blue-700">Giải trình đã gửi: {item.sellerNote}</p> : null}
                </div>

                <div className="space-y-3">
                  <textarea
                    value={notes[item.productId] ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [item.productId]: event.target.value }))}
                    placeholder="Nhập giải trình: nguồn gốc hàng, giấy tờ, cam kết mô tả đúng..."
                    className="min-h-28 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
                  />
                  <Input
                    value={evidenceUrls[item.productId] ?? ""}
                    onChange={(event) => setEvidenceUrls((current) => ({ ...current, [item.productId]: event.target.value }))}
                    placeholder="Link ảnh/tài liệu bằng chứng (nếu có)"
                  />
                  <Button
                    className="w-full bg-[#ee4d2d] hover:bg-[#d93f21]"
                    disabled={appealMutation.isPending}
                    onClick={() => submitAppeal(item.productId)}
                  >
                    <Send className="size-4" />
                    Gửi giải trình
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SellerDashboardLayout>
  );
}

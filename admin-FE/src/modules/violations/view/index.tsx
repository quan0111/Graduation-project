import { FileText, ShieldAlert, Undo2, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";

import {
  useModerationCases,
  useResolveModerationCase,
  useResolveSecurityIncident,
  useSecurityIncidents,
} from "../api/moderation";

const statusLabel: Record<string, string> = {
  OPEN: "Đang mở",
  SELLER_SUBMITTED: "Seller đã giải trình",
  UNDER_REVIEW: "Đang xem xét",
  APPROVED_RESTORED: "Đã khôi phục",
  REJECTED_UPHELD: "Giữ nguyên vi phạm",
  CLOSED: "Đã đóng",
};

export default function ViolationsPage() {
  const { data: cases = [], isLoading: isCasesLoading } = useModerationCases();
  const { data: incidents = [], isLoading: isIncidentsLoading } = useSecurityIncidents();
  const resolveCase = useResolveModerationCase();
  const resolveIncident = useResolveSecurityIncident();

  const handleResolveCase = async (id: number, decision: "RESTORE" | "UPHOLD") => {
    try {
      await resolveCase.mutateAsync({ id, decision });
      toast.success(decision === "RESTORE" ? "Đã khôi phục sản phẩm" : "Đã giữ nguyên xử lý vi phạm");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể xử lý hồ sơ vi phạm");
    }
  };

  const handleResolveIncident = async (id: number, unlockUser: boolean) => {
    try {
      await resolveIncident.mutateAsync({ id, unlockUser });
      toast.success(unlockUser ? "Đã xử lý và mở khóa user" : "Đã xử lý cảnh báo");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể xử lý cảnh báo");
    }
  };

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-lg border bg-white p-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-5 text-orange-600" />
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Vi phạm và bảo mật</h1>
            <p className="text-sm text-slate-500">Theo dõi sản phẩm bị khóa, seller giải trình và hành vi bất thường của người dùng.</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">Sản phẩm vi phạm</h2>
          <span className="text-sm text-slate-500">{cases.length} hồ sơ</span>
        </div>

        {isCasesLoading ? <p className="text-sm text-slate-500">Đang tải hồ sơ vi phạm...</p> : null}
        <div className="space-y-3">
          {cases.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-medium text-slate-950">{item.product?.name || `Sản phẩm #${item.productId}`}</p>
                  <p className="mt-1 text-sm text-slate-500">Shop: {item.product?.shop?.name || "Chưa rõ"} · {statusLabel[item.status] || item.status}</p>
                  <p className="mt-2 text-sm text-slate-700">Lý do: {item.reason}</p>
                  {item.sellerNote ? <p className="mt-2 text-sm text-blue-700">Seller giải trình: {item.sellerNote}</p> : null}
                  {item.evidence?.length ? <p className="mt-1 text-xs text-slate-500">Có {item.evidence.length} bằng chứng đính kèm</p> : null}
                  {item.evidence?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.evidence.map((evidence, index) => {
                        const url = typeof evidence.url === "string" ? evidence.url : "";
                        if (!url) return null;
                        const name = typeof evidence.name === "string" ? evidence.name : `Bằng chứng ${index + 1}`;
                        return (
                          <a
                            key={`${url}-${index}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-60 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-[#ee4d2d]"
                          >
                            <FileText className="size-3.5 shrink-0" />
                            <span className="truncate">{name}</span>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" disabled={resolveCase.isPending} onClick={() => handleResolveCase(item.id, "UPHOLD")}>
                    Giữ khóa
                  </Button>
                  <Button disabled={resolveCase.isPending} onClick={() => handleResolveCase(item.id, "RESTORE")}>
                    <Undo2 className="size-4" />
                    Khôi phục
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">Hành vi bất thường</h2>
          <span className="text-sm text-slate-500">{incidents.length} cảnh báo</span>
        </div>

        {isIncidentsLoading ? <p className="text-sm text-slate-500">Đang tải cảnh báo...</p> : null}
        <div className="space-y-3">
          {incidents.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-slate-950">{item.user?.email || `User #${item.userId}`}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.severity} · {item.status} · {formatDateTime(item.detectedAt)}</p>
                  <p className="mt-2 text-sm text-slate-700">{item.reason}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" disabled={resolveIncident.isPending} onClick={() => handleResolveIncident(item.id, false)}>
                    Đánh dấu đã xử lý
                  </Button>
                  <Button disabled={resolveIncident.isPending} onClick={() => handleResolveIncident(item.id, true)}>
                    <UserCheck className="size-4" />
                    Mở user
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

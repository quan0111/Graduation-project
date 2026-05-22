import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileClock, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuditLogs } from "../api/audit";

const severityClass: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-700",
  WARNING: "bg-amber-100 text-amber-700",
  ERROR: "bg-red-100 text-red-700",
  CRITICAL: "bg-purple-100 text-purple-700",
};

const pageSizeOptions = [10, 25, 50, 100];

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [severity, setSeverity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, severity, debouncedKeyword]);

  const query = useMemo(() => {
    const params: { page: number; pageSize: number; severity?: string; action?: string; entityType?: string } = {
      page,
      pageSize,
    };
    if (severity) params.severity = severity;
    if (debouncedKeyword) {
      if (/^[A-Z0-9_.:-]+$/i.test(debouncedKeyword)) {
        params.action = debouncedKeyword;
      } else {
        params.entityType = debouncedKeyword;
      }
    }
    return params;
  }, [debouncedKeyword, page, pageSize, severity]);

  const { data, isFetching, isError } = useAuditLogs(query);
  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-lg border bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <FileClock className="size-5 text-orange-600" />
            <div>
              <h1 className="text-xl font-semibold text-slate-950">Nhật ký audit</h1>
              <p className="text-sm text-slate-500">
                Ghi nhận đăng nhập, khóa user, xử lý đơn hàng và kiểm duyệt sản phẩm.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Lọc theo action hoặc entity"
                className="pl-9"
              />
            </div>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.currentTarget.value)}
              className="h-8 rounded-lg border border-input bg-white px-3 text-sm"
            >
              <option value="">Tất cả mức độ</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {isFetching ? "Đang tải..." : `Tổng ${total.toLocaleString("vi-VN")} bản ghi`}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Mỗi trang</span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.currentTarget.value))}
              className="h-8 rounded-lg border border-input bg-white px-2"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isError ? <p className="p-5 text-sm text-red-500">Không thể tải nhật ký audit.</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Người thao tác</th>
                <th className="px-4 py-3">Mức độ</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-3">{new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-3 font-medium text-slate-950">{log.action}</td>
                  <td className="px-4 py-3">
                    {log.entityType}
                    {log.entityId ? ` #${log.entityId}` : ""}
                  </td>
                  <td className="px-4 py-3">{log.actor?.email || log.actorId || "Hệ thống"}</td>
                  <td className="px-4 py-3">
                    <Badge className={severityClass[log.severity] ?? "bg-slate-100 text-slate-700"}>
                      {log.severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{log.ipAddress || "-"}</td>
                </tr>
              ))}
              {!isFetching && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Chưa có audit log phù hợp.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft className="size-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

import { FileClock } from "lucide-react";

import { useAuditLogs } from "../api/audit";

export default function AuditPage() {
  const { data: logs = [], isLoading } = useAuditLogs();

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-lg border bg-white p-5">
        <div className="flex items-center gap-3">
          <FileClock className="size-5 text-orange-600" />
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Nhật ký audit</h1>
            <p className="text-sm text-slate-500">Ghi nhận đăng nhập, khóa user, xử lý đơn hàng và kiểm duyệt sản phẩm.</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border bg-white">
        {isLoading ? <p className="p-5 text-sm text-slate-500">Đang tải nhật ký audit...</p> : null}
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
                  <td className="px-4 py-3">{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</td>
                  <td className="px-4 py-3">{log.actor?.email || log.actorId || "Hệ thống"}</td>
                  <td className="px-4 py-3">{log.severity}</td>
                  <td className="px-4 py-3">{log.ipAddress || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

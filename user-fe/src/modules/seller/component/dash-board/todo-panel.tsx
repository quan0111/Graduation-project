import { Clock, RefreshCcw, Star, Truck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { SellerDashboardTodo } from "../../types/dashboard";

interface SellerDashboardTodoPanelProps {
  todo: SellerDashboardTodo;
}

const todoConfig = [
  { key: "pending", label: "Chờ xác nhận", icon: Clock, color: "text-amber-600" },
  { key: "processing", label: "Đang xử lý", icon: Star, color: "text-blue-600" },
  { key: "shipping", label: "Đang giao", icon: Truck, color: "text-violet-600" },
  { key: "returns", label: "Đổi trả / hoàn", icon: RefreshCcw, color: "text-rose-600" },
] as const;

export function SellerDashboardTodoPanel({ todo }: SellerDashboardTodoPanelProps) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-950">Việc cần làm</CardTitle>
        <p className="text-sm text-slate-500">Danh sách lấy từ trạng thái đơn hiện tại</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {todoConfig.map((item) => (
          <button
            key={item.key}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/70"
            type="button"
          >
            <span className="flex items-center gap-3">
              <span className="rounded-xl bg-white p-2 shadow-sm">
                <item.icon className={cn("size-5", item.color)} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                <span className="text-xs text-slate-500">Số đơn cần theo dõi</span>
              </span>
            </span>
            <span className="text-2xl font-bold text-[#ee4d2d]">{todo[item.key]}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

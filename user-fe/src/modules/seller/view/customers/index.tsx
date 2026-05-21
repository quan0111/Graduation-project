import { useState, type ComponentType } from "react";
import { Mail, Phone, Search, ShoppingBag, TrendingUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useSellerCustomers } from "@/modules/seller/api/get-seller-customers";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function SellerCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: customers = [], isLoading } = useSellerCustomers();

  const filteredCustomers = customers.filter((customer) => {
    const keyword = searchQuery.toLowerCase();
    return customer.name?.toLowerCase().includes(keyword) || customer.email?.toLowerCase().includes(keyword);
  });

  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, customer) => sum + (customer.order_count || 0), 0);
  const totalSpent = customers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý khách hàng</h1>
            <p className="mt-1 text-sm text-slate-500">Danh sách khách đã mua hàng tại shop của bạn.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={ShoppingBag} label="Tổng khách hàng" value={String(totalCustomers)} tone="blue" />
          <MetricCard icon={TrendingUp} label="Tổng đơn hàng" value={String(totalOrders)} tone="emerald" />
          <MetricCard icon={TrendingUp} label="Tổng chi tiêu" value={currency.format(totalSpent)} tone="purple" />
          <MetricCard icon={ShoppingBag} label="Chi tiêu trung bình" value={currency.format(avgSpent)} tone="amber" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Đang tải khách hàng...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Chưa có khách hàng nào</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Liên hệ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Số đơn</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tổng chi tiêu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Đơn gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{customer.name || "Khách hàng"}</p>
                        <p className="text-sm text-slate-500">ID: {customer.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.email ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="size-3" />
                              {customer.email}
                            </div>
                          ) : null}
                          {customer.phone ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="size-3" />
                              {customer.phone}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900">{customer.order_count || 0}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{currency.format(customer.total_spent || 0)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString("vi-VN") : "Chưa có"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SellerDashboardLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "blue" | "emerald" | "purple" | "amber";
}) {
  const styles = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-3 ${styles}`}>
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

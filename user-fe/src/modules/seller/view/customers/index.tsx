import { useState } from "react";
import { Search, Mail, Phone, ShoppingBag, TrendingUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useSellerCustomers } from "@/modules/seller/api/get-seller-customers";

export default function SellerCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers = [], isLoading } = useSellerCustomers();

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum: number, c: any) => sum + (c.order_count || 0), 0);
  const totalSpent = customers.reduce((sum: number, c: any) => sum + (c.total_spent || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý khách hàng</h1>
            <p className="text-sm text-slate-500 mt-1">Danh sách khách hàng đã mua hàng</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-slate-900">{totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(totalSpent)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Chi tiêu TB</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(avgSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Đang tải khách hàng...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Không có khách hàng nào</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Khách hàng</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Liên hệ</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Số đơn</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Tổng chi tiêu</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Đơn gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer: any) => (
                    <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{customer.name || "N/A"}</p>
                          <p className="text-sm text-slate-500">ID: {customer.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900">{customer.order_count || 0}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(customer.total_spent || 0)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.last_order_date
                          ? new Date(customer.last_order_date).toLocaleDateString("vi-VN")
                          : "N/A"}
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

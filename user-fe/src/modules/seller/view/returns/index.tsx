import { useState } from "react";
import { Search, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SellerReturnsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  // Mock data - in real app, fetch returns for seller's shop
  const mockReturns = [
    {
      id: 1,
      orderId: 123,
      userId: 456,
      reason: "Sản phẩm bị lỗi",
      status: "PENDING",
      createdAt: "2024-01-15T10:30:00Z",
      items: [
        { id: 1, orderItemId: 10, quantity: 1, refundAmount: 100000 },
      ],
      evidences: [{ id: 1, imageUrl: "https://via.placeholder.com/150" }],
    },
    {
      id: 2,
      orderId: 124,
      userId: 457,
      reason: "Không đúng mô tả",
      status: "APPROVED",
      createdAt: "2024-01-14T15:20:00Z",
      items: [
        { id: 2, orderItemId: 11, quantity: 2, refundAmount: 200000 },
      ],
      evidences: [],
    },
  ];

  const filteredReturns = mockReturns.filter((r) => {
    const matchesSearch = r.orderId.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReview = async (returnId: number, status: "APPROVED" | "REJECTED") => {
    try {
      // TODO: Call API to review return request with returnId
      console.log(`Reviewing return ${returnId} with status ${status}`);
      toast.success(`Đã ${status === "APPROVED" ? "duyệt" : "từ chối"} yêu cầu trả hàng`);
      setSelectedReturn(null);
    } catch (error) {
      toast.error("Không thể xử lý yêu cầu trả hàng");
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "Chờ xử lý", variant: "secondary" },
      APPROVED: { label: "Đã duyệt", variant: "default" },
      REJECTED: { label: "Đã từ chối", variant: "destructive" },
    };
    const { label, variant } = config[status] || { label: status, variant: "secondary" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Yêu cầu Trả Hàng</h1>
          <p className="text-sm text-slate-500">Xem và xử lý các yêu cầu trả hàng từ khách hàng</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo mã đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Đã từ chối</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Lý do</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày tạo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Số lượng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hoàn tiền</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((returnReq) => (
                    <tr key={returnReq.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">#{returnReq.orderId}</td>
                      <td className="px-4 py-3 text-slate-600">{returnReq.reason}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(returnReq.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {returnReq.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Intl.NumberFormat("vi-VN").format(
                          returnReq.items.reduce((sum: number, item: any) => sum + item.refundAmount, 0)
                        )}
                        ₫
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(returnReq.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedReturn(returnReq)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {returnReq.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReview(returnReq.id, "APPROVED")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReview(returnReq.id, "REJECTED")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Chi tiết Yêu cầu Trả Hàng</h2>
              <button onClick={() => setSelectedReturn(null)} className="text-slate-400 hover:text-slate-600">
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Mã đơn hàng</p>
                  <p className="font-medium text-slate-900">#{selectedReturn.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Trạng thái</p>
                  <div>{getStatusBadge(selectedReturn.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ngày tạo</p>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedReturn.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Số tiền hoàn</p>
                  <p className="font-medium text-slate-900">
                    {new Intl.NumberFormat("vi-VN").format(
                      selectedReturn.items.reduce((sum: number, item: any) => sum + item.refundAmount, 0)
                    )}
                    ₫
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Lý do trả hàng</p>
                <p className="text-slate-900">{selectedReturn.reason}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Sản phẩm trả</p>
                <div className="space-y-2">
                  {selectedReturn.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between rounded-lg bg-slate-50 p-3">
                      <span>Mã sản phẩm: {item.orderItemId}</span>
                      <span>
                        Số lượng: {item.quantity} - Hoàn tiền:{" "}
                        {new Intl.NumberFormat("vi-VN").format(item.refundAmount)}₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.evidences.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Bằng chứng</p>
                  <div className="flex gap-2">
                    {selectedReturn.evidences.map((evidence: any) => (
                      <img
                        key={evidence.id}
                        src={evidence.imageUrl}
                        alt="Evidence"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedReturn.status === "PENDING" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleReview(selectedReturn.id, "REJECTED")}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <X className="mr-2 size-4" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => handleReview(selectedReturn.id, "APPROVED")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 size-4" />
                    Duyệt
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

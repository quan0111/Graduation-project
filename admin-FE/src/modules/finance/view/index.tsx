import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL_FINANCE } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { CommissionConfigCard } from "@/modules/finance/components/commission-config-card";

type Payout = {
  id: number;
  shopId: number;
  amount: number;
  status: string;
  createdAt: string;
  shop?: { id: number; name: string };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function AdminFinancePage() {
  const queryClient = useQueryClient();
  const { data: payouts = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "payouts"],
    queryFn: async (): Promise<Payout[]> => {
      const res = await apiClient.get(`${API_URL_FINANCE}/payouts`);
      return res.data;
    },
  });
  const updatePayout = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "PAID" | "FAILED" }) => {
      const res = await apiClient.patch(`${API_URL_FINANCE}/payout/${id}`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] }),
  });

  const pending = payouts.filter((payout) => payout.status === "PENDING");
  const paid = payouts.filter((payout) => payout.status === "PAID");

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Duyệt payout seller</h1>
        <p className="text-muted-foreground">Duyệt hoặc từ chối các yêu cầu rút tiền của seller.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Cho duyệt" value={pending.length} />
        <Metric label="Đã thanh toán" value={paid.length} />
        <Metric label="Tổng số" value={payouts.length} />
      </div>

      <CommissionConfigCard />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách payout</CardTitle>
          <CardDescription>{isLoading ? "Đang tải..." : `${payouts.length} yêu cầu`}</CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-sm text-destructive">Không tải được payout.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Mã</th>
                    <th className="px-4 py-3 text-left">Cửa hàng</th>
                    <th className="px-4 py-3 text-right">Số tiền</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-t">
                      <td className="px-4 py-3 font-medium">#{payout.id}</td>
                      <td className="px-4 py-3">{payout.shop?.name || `Shop #${payout.shopId}`}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(payout.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{payout.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={payout.status !== "PENDING" || updatePayout.isPending}
                            onClick={() => updatePayout.mutate({ id: payout.id, status: "PAID" })}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={payout.status !== "PENDING" || updatePayout.isPending}
                            onClick={() => updatePayout.mutate({ id: payout.id, status: "FAILED" })}
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!payouts.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Chưa có yêu cầu payout.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

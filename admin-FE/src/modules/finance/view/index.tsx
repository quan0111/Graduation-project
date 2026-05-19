import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL_FINANCE } from "@/constant/config";
import { apiClient } from "@/lib/api";

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
        <h1 className="text-2xl font-bold">Duyet payout seller</h1>
        <p className="text-muted-foreground">Duyet hoac tu choi cac yeu cau rut tien cua seller.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Cho duyet" value={pending.length} />
        <Metric label="Da thanh toan" value={paid.length} />
        <Metric label="Tong so" value={payouts.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sach payout</CardTitle>
          <CardDescription>{isLoading ? "Dang tai..." : `${payouts.length} yeu cau`}</CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-sm text-destructive">Khong tai duoc payout.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Ma</th>
                    <th className="px-4 py-3 text-left">Shop</th>
                    <th className="px-4 py-3 text-right">So tien</th>
                    <th className="px-4 py-3 text-center">Trang thai</th>
                    <th className="px-4 py-3 text-right">Thao tac</th>
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
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={payout.status !== "PENDING" || updatePayout.isPending}
                            onClick={() => updatePayout.mutate({ id: payout.id, status: "FAILED" })}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!payouts.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Chua co yeu cau payout.
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

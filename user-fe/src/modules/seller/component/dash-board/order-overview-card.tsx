import { CheckCircle2, PackageCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SellerDashboardOrderFlowItem, SellerDashboardWallet } from "../../types/dashboard";
import { formatCurrency } from "../../utils/dashboard";

interface SellerDashboardOrderOverviewCardProps {
  orderFlow: SellerDashboardOrderFlowItem[];
}

interface SellerDashboardWalletCardProps {
  wallet: SellerDashboardWallet;
}

export function SellerDashboardOrderOverviewCard({
  orderFlow,
}: SellerDashboardOrderOverviewCardProps) {
  return (
    <Card id="orders" className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-950">Luồng xử lý đơn hàng</CardTitle>
        <p className="text-sm text-slate-500">Tổng hợp theo trạng thái đơn hàng hiện tại</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          {orderFlow.map((stage) => (
            <div key={stage.label} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{stage.label}</p>
                <span className="text-xl font-bold text-slate-950">{stage.count}</span>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div className="h-full rounded-full bg-[#ee4d2d]" style={{ width: `${stage.progress}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-500">{stage.progress}% so với trạng thái cao nhất</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SellerDashboardWalletCard({ wallet }: SellerDashboardWalletCardProps) {
  return (
    <Card id="finance" className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-950">Ví người bán</CardTitle>
        <p className="text-sm text-slate-500">Tổng hợp trực tiếp từ dữ liệu đơn hàng</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <WalletRow icon={PackageCheck} label="Doanh thu gộp" value={formatCurrency(wallet.grossRevenue)} />
        <WalletRow icon={CheckCircle2} label="Doanh thu hoàn tất" value={formatCurrency(wallet.completedRevenue)} />
        <WalletRow icon={Truck} label="Doanh thu đang chờ" value={formatCurrency(wallet.pendingRevenue)} />
        <WalletRow icon={Truck} label="Giá trị đơn hủy" value={formatCurrency(wallet.cancelledRevenue)} />
        <Button variant="outline" className="w-full">
          Xem chi tiết đơn hàng
        </Button>
      </CardContent>
    </Card>
  );
}

function WalletRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PackageCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <span className="flex items-center gap-3">
        <span className="rounded-xl bg-white p-2 shadow-sm">
          <Icon className="size-5 text-[#ee4d2d]" />
        </span>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </span>
      <span className="font-bold text-slate-950">{value}</span>
    </div>
  );
}

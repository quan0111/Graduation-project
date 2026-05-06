import { Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { SellerDashboardShop, SellerDashboardUser } from "../../types/dashboard";

interface SellerDashboardHeroProps {
  shop: SellerDashboardShop;
  user: SellerDashboardUser | null;
}

export function SellerDashboardHero({ shop, user }: SellerDashboardHeroProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#ee4d2d] via-[#f05d31] to-[#ff8a3d] p-6 text-white shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Badge className="mb-4 bg-white/15 text-white hover:bg-white/20">Seller dashboard</Badge>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{shop.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/85">
          Theo dõi đơn hàng, doanh thu và tồn kho của shop trong một màn hình vận hành tập trung.
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 rounded-2xl bg-white/12 p-4 backdrop-blur sm:min-w-72">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20">
            <Store className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{user?.fullName || user?.email || "Seller"}</p>
            <p className="text-xs text-white/80">{shop.productCount} sản phẩm trong shop</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-white/85">
          {shop.description || "Cập nhật sản phẩm, theo dõi đơn hàng và xử lý vận hành tại đây."}
        </p>
        <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/15">
          Xem thông tin shop
        </Button>
      </div>
    </div>
  );
}

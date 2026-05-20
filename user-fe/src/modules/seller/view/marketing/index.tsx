import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Megaphone, Package, Plus, TicketPercent, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CouponForm } from "@/modules/coupon/components/couponForm";
import { useCreateCoupon } from "@/modules/coupon/api/create-coupon";
import { useGetCoupon } from "@/modules/coupon/api/get-coupon";
import { useGetSellerDashboard } from "@/modules/seller/api/get-dashboard";
import { type SellerProduct, useSellerProducts } from "@/modules/seller/api/get-seller-products";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useGetShopByOwnerId } from "@/modules/shop/api/myshop";
import { formatCurrency } from "@/modules/seller/utils/dashboard";

type CouponLike = Record<string, unknown>;

const normalizeCoupons = (value: unknown): CouponLike[] => {
  if (Array.isArray(value)) return value as CouponLike[];
  if (Array.isArray((value as { data?: unknown })?.data)) return (value as { data: CouponLike[] }).data;
  const nested = (value as { data?: { data?: unknown } })?.data?.data;
  if (Array.isArray(nested)) return nested as CouponLike[];
  return [];
};

const getCouponField = <T,>(coupon: CouponLike, camel: string, snake: string, fallback: T): T =>
  (coupon[camel] ?? coupon[snake] ?? fallback) as T;

const getProductStock = (product: SellerProduct) =>
  product.totalStock ?? product.variants?.reduce((sum, variant) => sum + Number(variant.stock || 0), 0) ?? 0;

const getPrimaryImage = (product: SellerProduct) =>
  product.images?.find((image) => image.isPrimary)?.url || product.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url;

export default function SellerMarketingPage() {
  const [showCouponForm, setShowCouponForm] = useState(false);
  const { data: dashboard } = useGetSellerDashboard();
  const { data: products = [], isLoading: productsLoading } = useSellerProducts();
  const { data: couponsData, isLoading: couponsLoading, refetch: refetchCoupons } = useGetCoupon();
  const { data: shop } = useGetShopByOwnerId();
  const createCouponMutation = useCreateCoupon();

  const shopCoupons = useMemo(() => {
    const shopId = shop?.id ?? dashboard?.shop?.id;
    return normalizeCoupons(couponsData).filter((coupon) => {
      const applicableShopId = getCouponField<number | null>(coupon, "applicableShopId", "applicable_shop_id", null);
      return shopId ? applicableShopId === shopId : false;
    });
  }, [couponsData, dashboard?.shop?.id, shop?.id]);

  const couponStats = useMemo(() => {
    const now = Date.now();
    return shopCoupons.reduce<{ active: number; expired: number; used: number; capacity: number }>(
      (stats, coupon) => {
        const isActive = getCouponField<boolean>(coupon, "isActive", "is_active", false);
        const validUntil = getCouponField<string | null>(coupon, "validUntil", "valid_until", null);
        const isExpired = Boolean(validUntil && new Date(validUntil).getTime() < now);
        const usedCount = getCouponField<number>(coupon, "usedCount", "used_count", 0);
        const usageLimit = getCouponField<number | null>(coupon, "usageLimit", "usage_limit", null);

        stats.used += usedCount;
        if (usageLimit) stats.capacity += usageLimit;
        if (isActive && !isExpired) stats.active += 1;
        if (isExpired) stats.expired += 1;
        return stats;
      },
      { active: 0, expired: 0, used: 0, capacity: 0 },
    );
  }, [shopCoupons]);

  const campaignProducts = useMemo(() => {
    return [...products]
      .sort((left, right) => {
        const leftStock = getProductStock(left);
        const rightStock = getProductStock(right);
        const leftActive = left.status === "ACTIVE" ? 1 : 0;
        const rightActive = right.status === "ACTIVE" ? 1 : 0;
        return rightActive - leftActive || rightStock - leftStock;
      })
      .slice(0, 5);
  }, [products]);

  const lowStockCount = products.filter((product) => {
    const stock = getProductStock(product);
    return stock > 0 && stock <= 10;
  }).length;

  const handleCreateCoupon = async (payload: any) => {
    try {
      await createCouponMutation.mutateAsync(payload);
      toast.success("Đã tạo coupon cho shop");
      setShowCouponForm(false);
      await refetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể tạo coupon");
    }
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#ee4d2d]">Seller Marketing</p>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">Chiến dịch bán hàng của shop</h1>
              <p className="mt-2 text-sm text-slate-500">
                Quản lý coupon, sản phẩm chủ lực và nhịp tăng trưởng theo dữ liệu shop.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowCouponForm(true)} disabled={!shop?.id && !dashboard?.shop?.id} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
                <Plus className="size-4" />
                Tạo coupon
              </Button>
              <Link to="/seller/analytics" className={buttonVariants({ variant: "outline" })}>
                <BarChart3 className="size-4" />
                Xem phân tích
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MarketingMetric icon={TicketPercent} label="Coupon đang chạy" value={String(couponStats.active)} loading={couponsLoading} />
          <MarketingMetric icon={TrendingUp} label="Lượt dùng coupon" value={String(couponStats.used)} loading={couponsLoading} />
          <MarketingMetric icon={Package} label="Sản phẩm active" value={String(dashboard?.overview.activeProducts ?? 0)} loading={productsLoading} />
          <MarketingMetric icon={Megaphone} label="Sắp hết hàng" value={String(lowStockCount)} loading={productsLoading} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_420px]">
          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Kênh khuyến mãi</CardTitle>
              <p className="text-sm text-slate-500">
                Coupon shop đang là kênh seller có thể tự vận hành trực tiếp.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <CampaignCard
                title="Coupon toàn shop"
                value={`${couponStats.active} mã`}
                helper={`${couponStats.used}/${couponStats.capacity || "∞"} lượt dùng`}
                tone="orange"
              />
              <CampaignCard
                title="Coupon hết hạn"
                value={`${couponStats.expired} mã`}
                helper="Nên kiểm tra lại lịch chạy"
                tone="slate"
              />
              <CampaignCard
                title="Doanh thu ước tính"
                value={formatCurrency(dashboard?.overview.grossRevenue ?? 0)}
                helper={`${dashboard?.overview.totalOrders ?? 0} đơn shop`}
                tone="green"
              />
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Coupon gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shopCoupons.slice(0, 5).map((coupon) => {
                const code = getCouponField<string>(coupon, "code", "code", "N/A");
                const discountType = getCouponField<string>(coupon, "discountType", "discount_type", "FIXED");
                const discountValue = getCouponField<number>(coupon, "discountValue", "discount_value", 0);
                const usedCount = getCouponField<number>(coupon, "usedCount", "used_count", 0);
                const isActive = getCouponField<boolean>(coupon, "isActive", "is_active", false);

                return (
                  <div key={String(coupon.id ?? code)} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{code}</p>
                      <Badge className={isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}>
                        {isActive ? "Đang chạy" : "Tắt"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {discountType === "PERCENTAGE" ? `${discountValue}%` : formatCurrency(discountValue)} · {usedCount} lượt dùng
                    </p>
                  </div>
                );
              })}
              {!couponsLoading && shopCoupons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  Shop chưa có coupon.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle>Sản phẩm nên đưa vào chiến dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {campaignProducts.map((product) => {
                const image = getPrimaryImage(product);
                const stock = getProductStock(product);

                return (
                  <Link
                    key={product.id}
                    to="/seller/products"
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    {image ? (
                      <img src={image} alt={product.name} className="aspect-square w-full rounded-xl object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-orange-100 text-[#ee4d2d]">
                        <Package className="size-8" />
                      </div>
                    )}
                    <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-950">{product.name}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Tồn {stock}</span>
                      <span>{formatCurrency(product.price)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {showCouponForm ? (
        <CouponForm
          isAdmin={false}
          shopId={shop?.id ?? dashboard?.shop?.id ?? 0}
          onCancel={() => setShowCouponForm(false)}
          onSubmit={handleCreateCoupon}
        />
      ) : null}
    </SellerDashboardLayout>
  );
}

function MarketingMetric({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Megaphone;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{loading ? "..." : value}</p>
        </div>
        <div className="rounded-2xl bg-orange-100 p-3 text-[#ee4d2d]">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  tone: "orange" | "slate" | "green";
}) {
  const toneClass = {
    orange: "bg-orange-50 text-orange-700",
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className={`rounded-2xl p-4 ${toneClass}`}>
      <p className="text-sm">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-xs opacity-80">{helper}</p>
    </div>
  );
}

import { useGetShopByOwnerId } from "@/modules/shop/api/shop";
import { useGetProductsByShop } from "@/modules/product/api/get-product-by-shop";
import { 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  AlertCircle,
  ChevronRight,
  Plus
} from "lucide-react";
import { useNavigate as useReactNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SellerDashboardPage() {
  const navigate = useReactNavigate();

  const { data: shop, isLoading: shopLoading } = useGetShopByOwnerId();

  const {
    data: products = [],
    isLoading: productsLoading,
  } = useGetProductsByShop(shop?.id || 0);

  // ✅ tránh lỗi khi shop chưa load xong mà products đã chạy
  const isLoading = shopLoading || (shop && productsLoading);

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'ACTIVE').length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  const revenue = {
    current: 12500000,
    previous: 10000000,
    growth: 25
  };

  // ================= LOADING =================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-20 w-full bg-muted/30 animate-pulse rounded-lg" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 w-full bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="h-80 w-full bg-muted/30 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // ================= NO SHOP =================
  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Chào mừng đến với Seller Center</h2>
            <p className="text-muted-foreground mb-6">
              Hãy tạo shop để bắt đầu bán hàng
            </p>
            <Button onClick={() => navigate("/seller/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo shop ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ================= MAIN =================
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tổng quan</h1>
            <p className="text-muted-foreground">
              Chào mừng trở lại, {shop.name}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/seller/products")}>
              Quản lý sản phẩm
            </Button>
            <Button onClick={() => navigate("/seller/new-product")}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Sản phẩm"
            value={stats.totalProducts}
            icon={<Package className="w-4 h-4" />}
            description={`${stats.activeProducts} đang bán`}
          />
          <StatCard
            title="Doanh thu"
            value={`${(revenue.current / 1000000).toFixed(1)}M`}
            icon={<DollarSign className="w-4 h-4" />}
            description={`+${revenue.growth}%`}
            trend="up"
          />
          <StatCard
            title="Tồn kho thấp"
            value={stats.lowStock}
            icon={<AlertCircle className="w-4 h-4" />}
            description={`${stats.outOfStock} hết hàng`}
            variant="warning"
          />
          <StatCard
            title="Đơn hàng"
            value="0"
            icon={<Clock className="w-4 h-4" />}
            description="Không có đơn"
          />
        </div>

      </div>
    </div>
  );
}

// ================= COMPONENT =================

function StatCard({ title, value, icon, description, trend, variant = "default" }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between">
          <span className="text-sm">{title}</span>
          {icon}
        </div>

        <div className="mt-2 text-2xl font-bold">{value}</div>

        <div className="flex items-center gap-1 mt-1 text-xs">
          {trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-500" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
          {description}
        </div>
      </CardContent>
    </Card>
  );
}
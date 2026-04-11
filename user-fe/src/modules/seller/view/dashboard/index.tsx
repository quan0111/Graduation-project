import { useGetShopByOwnerId } from "@/modules/shop/api/shop";
import { useGetSellerProducts } from "../../api/product";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  AlertCircle,
  ChevronRight,
  Plus
} from "lucide-react";
import { Link, useNavigate as useReactNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SellerDashboardPage() {
  const navigate = useReactNavigate();
  const { data: shop, isLoading: shopLoading } = useGetShopByOwnerId();
  const { data: products = [], isLoading: productsLoading } = useGetSellerProducts(shop?.id || 0);

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'ACTIVE').length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  // Mock revenue data (would come from API)
  const revenue = {
    current: 12500000,
    previous: 10000000,
    growth: 25
  };

  if (shopLoading) {
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
              Hãy tạo shop để bắt đầu bán hàng và quản lý sản phẩm của bạn
            </p>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate("/seller/create")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo shop ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
            <p className="text-muted-foreground mt-1">
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Sản phẩm"
            value={stats.totalProducts}
            icon={<Package className="w-4 h-4" />}
            description={`${stats.activeProducts} đang bán`}
          />
          <StatCard
            title="Doanh thu tháng"
            value={`${(revenue.current / 1000000).toFixed(1)}M`}
            icon={<DollarSign className="w-4 h-4" />}
            description={`+${revenue.growth}% so với tháng trước`}
            trend="up"
          />
          <StatCard
            title="Tồn kho thấp"
            value={stats.lowStock}
            icon={<AlertCircle className="w-4 h-4" />}
            description={`${stats.outOfStock} hết hàng`}
            variant={stats.lowStock > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Đơn chờ xử lý"
            value="0"
            icon={<Clock className="w-4 h-4" />}
            description="Không có đơn mới"
          />
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Sản phẩm gần đây</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý và theo dõi sản phẩm của bạn
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/seller/products")}
              className="flex items-center gap-1"
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-muted/30 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-muted/30 animate-pulse rounded" />
                      <div className="h-3 w-1/4 bg-muted/30 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState onAddProduct={() => navigate("/seller/new-product")} />
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div 
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.images?.[0]?.url ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-full w-full p-2 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </span>
                        <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                          {product.status === 'ACTIVE' ? 'Đang bán' : 'Tạm dừng'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Tồn: {product.stock}
                      </p>
                      {product.stock <= 10 && product.stock > 0 && (
                        <p className="text-xs text-orange-500">Sắp hết</p>
                      )}
                      {product.stock === 0 && (
                        <p className="text-xs text-red-500">Hết hàng</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: "up" | "down";
  variant?: "default" | "warning";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div className={`p-2 rounded-full ${
            variant === "warning" ? "bg-orange-100 text-orange-600" : "bg-primary/10 text-primary"
          }`}>
            {icon}
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" && (
              <ArrowUpRight className="w-3 h-3 text-green-500" />
            )}
            {trend === "down" && (
              <ArrowDownRight className="w-3 h-3 text-red-500" />
            )}
            <p className={`text-xs ${
              variant === "warning" ? "text-orange-500" : "text-muted-foreground"
            }`}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAddProduct }: { onAddProduct: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm nào</h3>
      <p className="text-muted-foreground mb-6">
        Bắt đầu bằng cách thêm sản phẩm đầu tiên của bạn
      </p>
      <Button onClick={onAddProduct}>
        <Plus className="w-4 h-4 mr-2" />
        Thêm sản phẩm
      </Button>
    </div>
  );
}
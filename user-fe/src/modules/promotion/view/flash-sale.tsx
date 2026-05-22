import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock3, Flame, Grid2X2, PackageCheck, Store, Tag } from "lucide-react";

import { ProductCard } from "@/modules/product/components/productcard";
import { useActiveFlashSales } from "@/modules/promotion/api/flash-sale";
import {
  getFlashSaleDiscountPercent,
  getFlashSaleDisplayPrice,
  getFlashSaleProducts,
  getProductCategoryLabel,
  getProductShopLabel,
  getRemainingFlashSaleStock,
} from "@/modules/promotion/utils/flash-sale";
import { useWishlistActions } from "@/modules/wishlist/hooks/useWishlistActions";

const FILTER_ALL = "all";

type SortMode = "discount" | "priceAsc" | "stock";

const TEXT = {
  back: "Quay lại khuyến mãi",
  eyebrow: "Flash sale",
  allCampaigns: "Tất cả flash sale",
  campaignUnavailable: "Chiến dịch chưa hiển thị",
  heroSubtitle:
    "Các sản phẩm đang giảm giá theo từng chiến dịch, có sẵn giá sau khuyến mãi và giá gốc trên card.",
  viewProducts: "Xem sản phẩm",
  activeCampaign: "Chiến dịch đang chạy",
  productCount: "Sản phẩm",
  maxDiscount: "Giảm tối đa",
  categoryCount: "Danh mục",
  from: "Từ",
  to: "đến",
  campaigns: "Chiến dịch",
  all: "Tất cả",
  products: "Sản phẩm flash sale",
  categories: "Danh mục",
  shops: "Shop",
  sort: "Sắp xếp",
  sortDiscount: "Giảm mạnh nhất",
  sortPriceAsc: "Giá sau giảm thấp nhất",
  sortStock: "Sắp hết suất",
  loading: "Đang tải flash sale...",
  error: "Không thể tải flash sale từ API.",
  emptyCampaign:
    "Chiến dịch flash sale này chưa có sản phẩm đang hoạt động hoặc đã hết thời gian chạy.",
  emptyAll: "Chưa có sản phẩm flash sale đang hoạt động.",
  emptyFilter: "Không có sản phẩm phù hợp với bộ lọc này.",
  related: "Ưu đãi liên quan",
  relatedSubtitle: "Thêm sản phẩm đang giảm giá trong các chiến dịch khác.",
  itemSuffix: "sp",
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export default function FlashSalePage() {
  const [searchParams] = useSearchParams();
  const campaignId = Number(searchParams.get("campaign") || 0);
  const hasCampaignFilter = Number.isFinite(campaignId) && campaignId > 0;
  const [selectedCategory, setSelectedCategory] = useState(FILTER_ALL);
  const [selectedShop, setSelectedShop] = useState(FILTER_ALL);
  const [sortMode, setSortMode] = useState<SortMode>("discount");
  const { wishlistIds, pendingProductId, toggleWishlist } = useWishlistActions();
  const { data: activeFlashSales = [], isLoading, isError } = useActiveFlashSales();

  const selectedSale = hasCampaignFilter
    ? activeFlashSales.find((sale) => sale.id === campaignId) ?? null
    : null;
  const visibleSales = useMemo(() => {
    if (hasCampaignFilter) {
      return selectedSale ? [selectedSale] : [];
    }

    return activeFlashSales;
  }, [activeFlashSales, hasCampaignFilter, selectedSale]);

  useEffect(() => {
    setSelectedCategory(FILTER_ALL);
    setSelectedShop(FILTER_ALL);
  }, [campaignId]);

  const products = useMemo(() => getFlashSaleProducts(visibleSales), [visibleSales]);
  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map(getProductCategoryLabel))).sort((a, b) => a.localeCompare(b, "vi")),
    [products],
  );
  const shopOptions = useMemo(
    () => Array.from(new Set(products.map(getProductShopLabel))).sort((a, b) => a.localeCompare(b, "vi")),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const matchedProducts = products.filter((product) => {
      const matchesCategory =
        selectedCategory === FILTER_ALL || getProductCategoryLabel(product) === selectedCategory;
      const matchesShop = selectedShop === FILTER_ALL || getProductShopLabel(product) === selectedShop;
      return matchesCategory && matchesShop;
    });

    return [...matchedProducts].sort((a, b) => {
      if (sortMode === "priceAsc") {
        return getFlashSaleDisplayPrice(a) - getFlashSaleDisplayPrice(b);
      }

      if (sortMode === "stock") {
        const stockA = getRemainingFlashSaleStock(a) ?? Number.POSITIVE_INFINITY;
        const stockB = getRemainingFlashSaleStock(b) ?? Number.POSITIVE_INFINITY;
        return stockA - stockB;
      }

      return getFlashSaleDiscountPercent(b) - getFlashSaleDiscountPercent(a);
    });
  }, [products, selectedCategory, selectedShop, sortMode]);

  const relatedProducts = useMemo(() => {
    if (!hasCampaignFilter || products.length === 0) {
      return [];
    }

    const currentCategories = new Set(products.map(getProductCategoryLabel));
    return getFlashSaleProducts(activeFlashSales.filter((sale) => sale.id !== campaignId))
      .filter((product) => currentCategories.has(getProductCategoryLabel(product)))
      .slice(0, 4);
  }, [activeFlashSales, campaignId, hasCampaignFilter, products]);

  const maxDiscount = products.reduce((max, product) => Math.max(max, getFlashSaleDiscountPercent(product)), 0);
  const heroTitle = selectedSale?.name || (hasCampaignFilter ? TEXT.campaignUnavailable : TEXT.allCampaigns);
  const heroTime = selectedSale
    ? `${TEXT.from} ${formatDateTime(selectedSale.startsAt)} ${TEXT.to} ${formatDateTime(selectedSale.endsAt)}`
    : null;
  const hasProducts = filteredProducts.length > 0;
  const emptyMessage = products.length > 0 ? TEXT.emptyFilter : hasCampaignFilter ? TEXT.emptyCampaign : TEXT.emptyAll;

  return (
    <main className="min-h-screen bg-[#fff7ed] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link to="/promotions" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
          <ArrowLeft className="size-4" />
          {TEXT.back}
        </Link>

        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
          <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
                  <Flame className="size-4" />
                  {TEXT.eyebrow}
                </div>
                <h1 className="mt-4 text-3xl font-bold md:text-5xl">{heroTitle}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                  {heroTime || TEXT.heroSubtitle}
                </p>
              </div>

              <a
                href="#flash-sale-products"
                className="inline-flex w-fit items-center justify-center rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
              >
                {TEXT.viewProducts}
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-orange-200">
                  <Clock3 className="size-4" />
                  {TEXT.activeCampaign}
                </p>
                <p className="mt-3 text-2xl font-bold">{visibleSales.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-orange-200">
                  <PackageCheck className="size-4" />
                  {TEXT.productCount}
                </p>
                <p className="mt-3 text-2xl font-bold">{products.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-orange-200">
                  <Tag className="size-4" />
                  {TEXT.maxDiscount}
                </p>
                <p className="mt-3 text-2xl font-bold">-{maxDiscount}%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-orange-100">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Grid2X2 className="size-4 text-orange-600" />
            {TEXT.campaigns}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              to="/flash-sale"
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                !hasCampaignFilter ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              {TEXT.all}
            </Link>
            {activeFlashSales.map((sale) => (
              <Link
                key={sale.id}
                to={`/flash-sale?campaign=${sale.id}`}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  campaignId === sale.id ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                {sale.name} ({sale.items.length} {TEXT.itemSuffix})
              </Link>
            ))}
          </div>
        </section>

        <section id="flash-sale-products" className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-orange-100 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">{TEXT.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{TEXT.products}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredProducts.length}/{products.length} {TEXT.productCount.toLowerCase()}
              </p>
            </div>

            <label className="text-sm font-medium text-slate-700">
              <span className="mb-1 block">{TEXT.sort}</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.currentTarget.value as SortMode)}
                className="h-10 rounded-xl border border-orange-100 bg-white px-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="discount">{TEXT.sortDiscount}</option>
                <option value="priceAsc">{TEXT.sortPriceAsc}</option>
                <option value="stock">{TEXT.sortStock}</option>
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Grid2X2 className="size-4 text-orange-600" />
                {TEXT.categories}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[FILTER_ALL, ...categoryOptions].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedCategory === category
                        ? "bg-slate-950 text-white"
                        : "bg-orange-50 text-slate-700 hover:bg-orange-100"
                    }`}
                  >
                    {category === FILTER_ALL ? TEXT.all : category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Store className="size-4 text-orange-600" />
                {TEXT.shops}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[FILTER_ALL, ...shopOptions].map((shop) => (
                  <button
                    key={shop}
                    type="button"
                    onClick={() => setSelectedShop(shop)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedShop === shop
                        ? "bg-slate-950 text-white"
                        : "bg-orange-50 text-slate-700 hover:bg-orange-100"
                    }`}
                  >
                    {shop === FILTER_ALL ? TEXT.all : shop}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl bg-orange-50 p-6 text-sm text-slate-500">{TEXT.loading}</div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl bg-rose-50 p-6 text-sm text-rose-600">{TEXT.error}</div>
          ) : null}

          {!isLoading && !isError && hasProducts ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.has(product.id)}
                  wishlistPending={pendingProductId === product.id}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : null}

          {!isLoading && !isError && !hasProducts ? (
            <div className="rounded-2xl bg-orange-50 p-6 text-sm text-slate-500">{emptyMessage}</div>
          ) : null}
        </section>

        {relatedProducts.length > 0 ? (
          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">{TEXT.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{TEXT.related}</h2>
              <p className="mt-1 text-sm text-slate-500">{TEXT.relatedSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.has(product.id)}
                  wishlistPending={pendingProductId === product.id}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckSquare, Grid2X2, PackagePlus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetCategories, type Category } from "@/modules/categories/api/category";
import { useProducts } from "@/modules/products/api/get-all-product";
import type { IProduct } from "@/modules/products/types";

import type { FlashSale, FlashSaleBulkItemCreatePayload } from "../types";
import { getApiErrorMessage } from "../utils/error";

type Mode = "products" | "categories";

type FormState = {
  discountPercent: string;
  stockLimit: string;
  purchaseLimit: string;
  search: string;
};

type Props = {
  sale: FlashSale | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: FlashSaleBulkItemCreatePayload) => Promise<void>;
};

const COPY = {
  title: "Thêm sản phẩm flash sale",
  description:
    "Chọn nhiều sản phẩm trong bảng hoặc chọn nhiều danh mục, hệ thống sẽ tự tính giá sau giảm.",
  products: "Theo sản phẩm",
  categories: "Theo danh mục",
  search: "Tìm sản phẩm",
  discountPercent: "Phần trăm giảm",
  stockLimit: "Giới hạn suất",
  purchaseLimit: "Giới hạn mua/người",
  selected: "Đã chọn",
  product: "sản phẩm",
  category: "danh mục",
  categoryPreview: "Sản phẩm active trong danh mục",
  allVisible: "Chọn trang này",
  clear: "Bỏ chọn",
  name: "Sản phẩm",
  categoryColumn: "Danh mục",
  shop: "Shop",
  price: "Giá gốc",
  salePrice: "Giá sau giảm",
  stock: "Tồn",
  status: "Trạng thái",
  emptyProducts: "Không có sản phẩm active phù hợp.",
  emptyCategories: "Chưa có danh mục.",
  loading: "Đang tải dữ liệu...",
  cancel: "Hủy",
  submit: "Thêm vào flash sale",
  submitting: "Đang thêm...",
  selectRequired: "Cần chọn ít nhất 1 sản phẩm hoặc 1 danh mục.",
  invalidDiscount: "Phần trăm giảm phải lớn hơn 0 và nhỏ hơn 100.",
  invalidStock: "Giới hạn suất phải là số nguyên dương hoặc để trống.",
  invalidPurchase:
    "Giới hạn mua phải là số nguyên dương hoặc để trống.",
  failed: "Thêm sản phẩm flash sale thất bại.",
};

const INITIAL_FORM: FormState = {
  discountPercent: "15",
  stockLimit: "",
  purchaseLimit: "",
  search: "",
};

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)}đ`;

const readOptionalPositiveInteger = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
};

const flattenCategories = (categories: Category[]) => {
  const categoryMap = new Map<number, Category>();

  const visit = (category: Category) => {
    if (categoryMap.has(category.id)) {
      return;
    }
    categoryMap.set(category.id, category);
    category.children?.forEach(visit);
  };

  categories.forEach(visit);
  return Array.from(categoryMap.values());
};

const getSalePrice = (product: IProduct, discountPercent: number) => {
  return Math.max(Math.round(product.price * (1 - discountPercent / 100)), 0);
};

const getCategoryName = (product: IProduct) => product.category?.name || `#${product.categoryId}`;
const getShopName = (product: IProduct) => product.shop?.name || `#${product.shopId}`;

export function FlashSaleItemDialog({ sale, pending = false, onOpenChange, onSubmit }: Props) {
  const [mode, setMode] = useState<Mode>("products");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const open = Boolean(sale);
  const productsQuery = useProducts({ config: { enabled: open } });
  const categoriesQuery = useGetCategories({ enabled: open });

  useEffect(() => {
    if (open) {
      setMode("products");
      setForm({ ...INITIAL_FORM });
      setSelectedProductIds([]);
      setSelectedCategoryIds([]);
      setError(null);
    }
  }, [open, sale?.id]);

  const products = productsQuery.data ?? [];
  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "ACTIVE" && product.price > 0 && product.shopId),
    [products],
  );
  const categories = useMemo(() => flattenCategories(categoriesQuery.data ?? []), [categoriesQuery.data]);
  const selectedCategoryProductCount = useMemo(() => {
    if (!selectedCategoryIds.length) {
      return 0;
    }

    const selected = new Set(selectedCategoryIds);
    return activeProducts.filter((product) => selected.has(product.categoryId)).length;
  }, [activeProducts, selectedCategoryIds]);
  const discountPercent = Number(form.discountPercent);
  const effectiveDiscount = Number.isFinite(discountPercent) ? discountPercent : 0;
  const filteredProducts = useMemo(() => {
    const keyword = form.search.trim().toLowerCase();
    if (!keyword) {
      return activeProducts;
    }

    return activeProducts.filter((product) => {
      const haystack = `${product.name} ${getCategoryName(product)} ${getShopName(product)} ${product.id}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [activeProducts, form.search]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleId = (ids: number[], id: number) => {
    return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  };

  const toggleProduct = (productId: number) => {
    setSelectedProductIds((current) => toggleId(current, productId));
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((current) => toggleId(current, categoryId));
  };

  const selectVisibleProducts = () => {
    const visibleIds = filteredProducts.map((product) => product.id);
    setSelectedProductIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === "products" && selectedProductIds.length === 0) {
      setError(COPY.selectRequired);
      return;
    }
    if (mode === "categories" && selectedCategoryIds.length === 0) {
      setError(COPY.selectRequired);
      return;
    }

    if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent >= 100) {
      setError(COPY.invalidDiscount);
      return;
    }

    const stockLimit = readOptionalPositiveInteger(form.stockLimit);
    if (stockLimit === undefined) {
      setError(COPY.invalidStock);
      return;
    }

    const purchaseLimit = readOptionalPositiveInteger(form.purchaseLimit);
    if (purchaseLimit === undefined) {
      setError(COPY.invalidPurchase);
      return;
    }

    const payload: FlashSaleBulkItemCreatePayload = {
      discountPercent,
      stockLimit,
      purchaseLimit,
      ...(mode === "products" ? { productIds: selectedProductIds } : { categoryIds: selectedCategoryIds }),
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, COPY.failed));
    }
  };

  const selectedCount = mode === "products" ? selectedProductIds.length : selectedCategoryIds.length;
  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>
            {sale?.name ? `${sale.name}. ${COPY.description}` : COPY.description}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={mode === "products" ? "default" : "outline"}
              onClick={() => setMode("products")}
            >
              <PackagePlus className="h-4 w-4" />
              {COPY.products}
            </Button>
            <Button
              type="button"
              variant={mode === "categories" ? "default" : "outline"}
              onClick={() => setMode("categories")}
            >
              <Grid2X2 className="h-4 w-4" />
              {COPY.categories}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="flash-sale-discount">{COPY.discountPercent}</Label>
              <Input
                id="flash-sale-discount"
                min={1}
                max={99}
                step="0.1"
                type="number"
                value={form.discountPercent}
                onChange={(event) => updateField("discountPercent", event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-stock-limit">{COPY.stockLimit}</Label>
              <Input
                id="flash-sale-stock-limit"
                min={1}
                step={1}
                type="number"
                value={form.stockLimit}
                onChange={(event) => updateField("stockLimit", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-purchase-limit">{COPY.purchaseLimit}</Label>
              <Input
                id="flash-sale-purchase-limit"
                min={1}
                step={1}
                type="number"
                value={form.purchaseLimit}
                onChange={(event) => updateField("purchaseLimit", event.currentTarget.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                {COPY.selected}: {selectedCount} {mode === "products" ? COPY.product : COPY.category}
              </span>
              {mode === "categories" ? (
                <span className="text-muted-foreground">
                  {COPY.categoryPreview}: {selectedCategoryProductCount} {COPY.product}
                </span>
              ) : null}
            </div>
          </div>

          {isLoading ? <div className="rounded-lg border p-3 text-sm text-muted-foreground">{COPY.loading}</div> : null}

          {mode === "products" ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-sm flex-1 space-y-2">
                  <Label htmlFor="flash-sale-product-search">{COPY.search}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="flash-sale-product-search"
                      className="pl-9"
                      value={form.search}
                      onChange={(event) => updateField("search", event.currentTarget.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={selectVisibleProducts}>
                    <CheckSquare className="h-4 w-4" />
                    {COPY.allVisible}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setSelectedProductIds([])}>
                    {COPY.clear}
                  </Button>
                </div>
              </div>

              <div className="max-h-[360px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>{COPY.name}</TableHead>
                      <TableHead>{COPY.categoryColumn}</TableHead>
                      <TableHead>{COPY.shop}</TableHead>
                      <TableHead>{COPY.price}</TableHead>
                      <TableHead>{COPY.salePrice}</TableHead>
                      <TableHead>{COPY.stock}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const checked = selectedProductIds.includes(product.id);
                      return (
                        <TableRow key={product.id} data-state={checked ? "selected" : undefined}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProduct(product.id)}
                              className="h-4 w-4 rounded border-input"
                            />
                          </TableCell>
                          <TableCell className="max-w-[260px]">
                            <div className="truncate font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">#{product.id}</div>
                          </TableCell>
                          <TableCell>{getCategoryName(product)}</TableCell>
                          <TableCell>{getShopName(product)}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell className="font-medium text-destructive">
                            {formatCurrency(getSalePrice(product, effectiveDiscount))}
                          </TableCell>
                          <TableCell>{product.totalStock ?? "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                    {!filteredProducts.length ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          {COPY.emptyProducts}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid max-h-[360px] gap-2 overflow-auto rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const checked = selectedCategoryIds.includes(category.id);
                  const productCount = activeProducts.filter((product) => product.categoryId === category.id).length;
                  return (
                    <label
                      key={category.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                        checked ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(category.id)}
                        className="mt-1 h-4 w-4 rounded border-input"
                      />
                      <span>
                        <span className="block font-medium">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {productCount} {COPY.product}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {!categories.length ? <div className="text-sm text-muted-foreground">{COPY.emptyCategories}</div> : null}
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={() => setSelectedCategoryIds([])}>
                  {COPY.clear}
                </Button>
              </div>
            </div>
          )}

          {error && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              {COPY.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? COPY.submitting : COPY.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

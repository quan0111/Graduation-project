import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Eye, Package, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductFormModal } from "@/modules/seller/component/product-form-modal";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useDeleteProduct } from "@/modules/seller/api/delete-product";
import { type SellerProduct, useSellerProducts } from "@/modules/seller/api/get-seller-products";
import { formatDateTime as formatDateTimeValue } from "@/lib/date";
import { cn } from "@/lib/utils";

type ProductFilterStatus = "all" | "active" | "inactive";

const productStatusMeta: Record<string, { label: string; tone: string }> = {
  ACTIVE: { label: "Đang bán", tone: "bg-emerald-50 text-emerald-700" },
  DRAFT: { label: "Bản nháp", tone: "bg-slate-100 text-slate-700" },
  APPROVAL: { label: "Chờ duyệt", tone: "bg-amber-50 text-amber-700" },
  REJECT: { label: "Bị từ chối", tone: "bg-rose-50 text-rose-700" },
  BANNED: { label: "Bị khóa", tone: "bg-rose-50 text-rose-700" },
  OUT_OF_STOCK: { label: "Hết hàng", tone: "bg-rose-50 text-rose-700" },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDateTime = (value?: string) => {
  return formatDateTimeValue(value, "N/A");
};

const getProductStock = (product: SellerProduct) =>
  product.totalStock ?? product.variants?.reduce((sum, variant) => sum + Number(variant.stock || 0), 0) ?? 0;

const getProductSku = (product: SellerProduct) =>
  product.variants?.find((variant) => variant.sku)?.sku || `SP-${product.id}`;

const getPrimaryImage = (product: SellerProduct) =>
  product.images?.find((image) => image.isPrimary)?.url || product.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url;

const getStatusMeta = (product: SellerProduct) => {
  if (getProductStock(product) <= 0) {
    return productStatusMeta.OUT_OF_STOCK;
  }

  return productStatusMeta[product.status] ?? { label: product.status, tone: "bg-slate-100 text-slate-700" };
};

export default function SellerProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<SellerProduct | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProductFilterStatus>("all");

  const { data: products = [], isLoading, refetch } = useSellerProducts();
  const deleteMutation = useDeleteProduct();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const searchValue = searchQuery.trim().toLowerCase();
        const sku = getProductSku(product).toLowerCase();
        const matchesSearch =
          !searchValue ||
          product.name.toLowerCase().includes(searchValue) ||
          sku.includes(searchValue) ||
          product.category?.name?.toLowerCase().includes(searchValue);
        const isActive = product.status === "ACTIVE" && getProductStock(product) > 0;
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "active" && isActive) ||
          (filterStatus === "inactive" && !isActive);

        return matchesSearch && matchesStatus;
      }),
    [filterStatus, products, searchQuery],
  );

  const handleDelete = async () => {
    if (!deleteCandidate) return;

    try {
      await deleteMutation.mutateAsync(deleteCandidate.id);
      toast.success("Xóa sản phẩm thành công");
      setDeleteCandidate(null);
      setSelectedProduct((current) => (current?.id === deleteCandidate.id ? null : current));
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể xóa sản phẩm");
    }
  };

  const handleSuccess = () => {
    setEditingProduct(null);
    refetch();
  };

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>
            <p className="mt-1 text-sm text-slate-500">Xem chi tiết, chỉnh sửa và theo dõi trạng thái sản phẩm của shop</p>
          </div>
          <Link
            to="/seller/products/new"
            className={cn(buttonVariants(), "bg-[#ee4d2d] hover:bg-[#d93f21]")}
          >
            <Plus className="size-4" />
            Thêm sản phẩm mới
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo tên sản phẩm, SKU hoặc danh mục..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "Tất cả" },
              { value: "active", label: "Đang bán" },
              { value: "inactive", label: "Chưa bán" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={filterStatus === option.value ? "default" : "outline"}
                onClick={() => setFilterStatus(option.value as ProductFilterStatus)}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">Đang tải sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-12 text-center">
            <p className="mb-4 text-slate-500">Chưa có sản phẩm phù hợp</p>
            <Link to="/seller/products/new" className={buttonVariants({ variant: "outline" })}>
              <Plus className="size-4" />
              Thêm sản phẩm đầu tiên
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Sản phẩm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Giá từ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kho</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phân loại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const statusMeta = getStatusMeta(product);
                    const imageUrl = getPrimaryImage(product);

                    return (
                      <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.name} className="size-12 rounded-lg object-cover" />
                            ) : (
                              <div className="flex size-12 items-center justify-center rounded-lg bg-orange-50 text-[#ee4d2d]">
                                <Package className="size-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-sm text-slate-500">SKU: {getProductSku(product)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 text-slate-700">{getProductStock(product)}</td>
                        <td className="px-6 py-4 text-slate-700">{product.variants?.length || 0}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn("bg-transparent", statusMeta.tone)}>{statusMeta.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedProduct(product)} aria-label="Xem chi tiết sản phẩm">
                              <Eye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => setEditingProduct(product)} aria-label="Sửa sản phẩm">
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteCandidate(product)}
                              className="text-red-600 hover:text-red-700"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editingProduct && (
          <ProductFormModal
            isOpen={Boolean(editingProduct)}
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSuccess={handleSuccess}
          />
        )}

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEdit={() => {
              setEditingProduct(selectedProduct);
              setSelectedProduct(null);
            }}
            onDelete={() => setDeleteCandidate(selectedProduct)}
          />
        )}

        {deleteCandidate && (
          <ConfirmProductDeleteModal
            product={deleteCandidate}
            isPending={deleteMutation.isPending}
            onCancel={() => setDeleteCandidate(null)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </SellerDashboardLayout>
  );
}

function ProductDetailModal({
  product,
  onClose,
  onEdit,
  onDelete,
}: {
  product: SellerProduct;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusMeta = getStatusMeta(product);
  const images = [...(product.images ?? [])].sort((left, right) => Number(left.position || 0) - Number(right.position || 0));
  const primaryImage = getPrimaryImage(product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#ee4d2d]">Chi tiết sản phẩm</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{product.name}</h2>
            <p className="mt-1 text-sm text-slate-500">SKU: {getProductSku(product)}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-3">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="aspect-square w-full rounded-2xl object-cover ring-1 ring-slate-200" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-orange-50 text-[#ee4d2d] ring-1 ring-orange-100">
                <Package className="size-12" />
              </div>
            )}
            {images.length > 1 ? (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((image) => (
                  <img key={image.id ?? image.url} src={image.url} alt={product.name} className="aspect-square rounded-xl object-cover ring-1 ring-slate-200" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Giá từ" value={formatCurrency(product.price)} />
              <InfoBlock label="Tồn kho" value={`${getProductStock(product)} sản phẩm`} />
              <InfoBlock label="Danh mục" value={product.category?.name || `#${product.categoryId ?? "N/A"}`} />
              <InfoBlock label="Ngày tạo" value={formatDateTime(product.createdAt)} />
              <InfoBlock label="Cập nhật" value={formatDateTime(product.updatedAt ?? product.createdAt)} />
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Trạng thái</p>
                <Badge className={cn("mt-2 bg-transparent", statusMeta.tone)}>{statusMeta.label}</Badge>
              </div>
            </div>

            <section>
              <p className="mb-2 text-sm font-semibold text-slate-900">Mô tả</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {product.description?.trim() || "Sản phẩm chưa có mô tả."}
              </p>
            </section>

            {product.attributes?.length ? (
              <section>
                <p className="mb-2 text-sm font-semibold text-slate-900">Thuộc tính</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.attributes.map((attribute) => (
                    <InfoBlock key={attribute.id} label={attribute.key} value={attribute.value} />
                  ))}
                </div>
              </section>
            ) : null}

            {product.tags?.length ? (
              <section>
                <p className="mb-2 text-sm font-semibold text-slate-900">Thẻ</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <section className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-900">Phân loại bán hàng</p>
          {product.variants?.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tên phân loại</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Giá</th>
                    <th className="px-4 py-3 font-medium">Tồn kho</th>
                    <th className="px-4 py-3 font-medium">Khối lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{variant.name}</td>
                      <td className="px-4 py-3 text-slate-600">{variant.sku || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(variant.price)}</td>
                      <td className="px-4 py-3 text-slate-600">{variant.stock}</td>
                      <td className="px-4 py-3 text-slate-600">{variant.weight ? `${variant.weight}g` : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Sản phẩm chưa có phân loại bán hàng.
            </div>
          )}
        </section>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="size-4" />
            Xóa sản phẩm
          </Button>
          <Button onClick={onEdit} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
            <Edit className="size-4" />
            Sửa sản phẩm
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-950">{value}</p>
    </div>
  );
}

function ConfirmProductDeleteModal({
  product,
  isPending,
  onCancel,
  onConfirm,
}: {
  product: SellerProduct;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Xóa sản phẩm?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sản phẩm "{product.name}" sẽ được gỡ khỏi danh sách bán. Hành động này dùng luồng xóa mềm của backend.
            </p>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </div>
      </div>
    </div>
  );
}

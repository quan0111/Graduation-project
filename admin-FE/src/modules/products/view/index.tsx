import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { TextPromptDialog } from "@/components/common/app-dialog";

import { useProducts } from "../api/get-all-product";
import { useGetCategories } from "@/modules/categories/api/category";
import { useReportProductViolation } from "../api/report-product-violation";
import { useUpdateProduct } from "../api/update-product-id";
import { productColumns } from "../component/product-collum";
import { ProductFilter } from "../component/filter-search-product";
import { ProductPreviewModal } from "../component/product-preview-modal";

type ProductStatus = "ACTIVE" | "REJECT" | "BANNED";
type ProductModerationStatus = "REJECT" | "BANNED";

export default function ProductsPage() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useGetCategories();
  const updateProductMutation = useUpdateProduct();
  const reportViolationMutation = useReportProductViolation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [moderationTarget, setModerationTarget] = useState<{ product: any; status: ProductModerationStatus } | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<any>(null);

  const filtered = useMemo(
    () =>
      products.filter((product: any) => {
        const matchSearch =
          product.name?.toLowerCase().includes(search.toLowerCase()) ||
          product.shop?.name?.toLowerCase().includes(search.toLowerCase());

        const matchStatus =
          status === "all" ||
          (status === "pending" && product.status === "DRAFT") ||
          (status === "approved" && product.status === "ACTIVE") ||
          (status === "rejected" && product.status === "REJECT") ||
          (status === "banned" && product.status === "BANNED");

        const matchCategory = category === "all" || product.category?.name === category;
        return matchSearch && matchStatus && matchCategory;
      }),
    [category, products, search, status],
  );

  const patchStatus = async (id: number, nextStatus: ProductStatus, successMessage: string, reason?: string) => {
    try {
      await updateProductMutation.mutateAsync({
        id,
        data: { status: nextStatus, banReason: reason },
      });
      toast.success(successMessage);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Cập nhật trạng thái thất bại");
    }
  };

  const handleApprove = (product: any) => {
    if (["BANNED", "REJECT"].includes(product.status)) {
      setUnbanTarget(product);
      return;
    }
    patchStatus(product.id, "ACTIVE", "Đã duyệt sản phẩm");
  };
  const openModerationDialog = (product: any, nextStatus: ProductModerationStatus) => {
    setModerationTarget({ product, status: nextStatus });
  };

  const handleModerationSubmit = async (reason: string) => {
    if (!moderationTarget) return;
    const { product, status: nextStatus } = moderationTarget;
    try {
      await reportViolationMutation.mutateAsync({ id: product.id, status: nextStatus, reason });
      toast.success(
        nextStatus === "REJECT"
          ? "Đã từ chối sản phẩm và tạo hồ sơ vi phạm"
          : "Đã khóa sản phẩm và tạo hồ sơ vi phạm",
      );
      setModerationTarget(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          (nextStatus === "REJECT" ? "Từ chối sản phẩm thất bại" : "Khóa sản phẩm thất bại"),
      );
    }
  };

  const handleReject = (product: any) => openModerationDialog(product, "REJECT");
  const handleBan = (product: any) => openModerationDialog(product, "BANNED");
  const handleUnban = (product: any) => {
    setUnbanTarget(product);
  };

  const handleConfirmUnban = async (reason: string) => {
    if (!unbanTarget) return;
    await patchStatus(unbanTarget.id, "ACTIVE", "Đã mở bán lại sản phẩm", reason);
    setUnbanTarget(null);
  };

  const handleView = (product: any) => {
    setSelected(product);
    setOpen(true);
  };

  const handleBulkApprove = async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) =>
        updateProductMutation.mutateAsync({
          id,
          data: { status: "ACTIVE", banReason: "Bulk approve by admin" },
        }),
      ),
    );
    const successCount = results.filter((result) => result.status === "fulfilled").length;
    const failedCount = results.length - successCount;
    setSelectedIds([]);
    if (failedCount > 0) {
      toast.error(`Duyệt ${successCount}/${results.length} sản phẩm, ${failedCount} lỗi`);
    } else {
      toast.success("Đã duyệt các sản phẩm được chọn");
    }
  };

  return (
    <main className="w-full flex-1 overflow-auto p-6">
      <ProductFilter search={search} setSearch={setSearch} status={status} setStatus={setStatus} data={products} />

      <div className="mb-4">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        <Button disabled={selectedIds.length === 0} onClick={handleBulkApprove}>
          Duyệt ({selectedIds.length})
        </Button>
      </div>

      <DataTable
        data={filtered}
        columns={productColumns(handleApprove, handleReject, handleBan, handleUnban, handleView)}
        title="Danh sách sản phẩm"
        onSelectChange={setSelectedIds}
      />

      <ProductPreviewModal open={open} onClose={() => setOpen(false)} product={selected} />

      <TextPromptDialog
        open={Boolean(moderationTarget)}
        title={moderationTarget?.status === "REJECT" ? "Từ chối sản phẩm" : "Cấm bán sản phẩm"}
        description={moderationTarget ? `Nhập lý do xử lý sản phẩm "${moderationTarget.product.name}".` : ""}
        label="Lý do"
        placeholder="Nhập lý do rõ ràng để shop có thể theo dõi"
        confirmLabel={moderationTarget?.status === "REJECT" ? "Từ chối" : "Cấm bán"}
        multiline
        isPending={reportViolationMutation.isPending}
        onOpenChange={(dialogOpen) => !dialogOpen && setModerationTarget(null)}
        onConfirm={handleModerationSubmit}
      />

      <TextPromptDialog
        open={Boolean(unbanTarget)}
        title="Mở bán lại sản phẩm"
        description={unbanTarget ? `Mở bán lại sản phẩm "${unbanTarget.name}"?` : ""}
        confirmLabel="Mở bán lại"
        label="Lý do"
        placeholder="Nhập lý do mở bán lại"
        multiline
        isPending={updateProductMutation.isPending}
        onOpenChange={(dialogOpen) => !dialogOpen && setUnbanTarget(null)}
        onConfirm={handleConfirmUnban}
      />
    </main>
  );
}

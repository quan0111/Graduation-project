import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";

import { useProducts } from "../api/get-all-product";
import { useGetCategories } from "@/modules/categories/api/category";
import { useReportProductViolation } from "../api/report-product-violation";
import { useUpdateProduct } from "../api/update-product-id";
import { productColumns } from "../component/product-collum";
import { ProductFilter } from "../component/filter-search-product";
import { ProductPreviewModal } from "../component/product-preview-modal";

type ProductStatus = "ACTIVE" | "REJECT" | "BANNED";

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

  const patchStatus = async (id: number, nextStatus: ProductStatus, successMessage: string) => {
    try {
      await updateProductMutation.mutateAsync({
        id,
        data: { status: nextStatus },
      });
      toast.success(successMessage);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Cap nhat trang thai that bai");
    }
  };

  const handleApprove = (product: any) => patchStatus(product.id, "ACTIVE", "Da duyet san pham");
  const handleReject = async (product: any) => {
    const reason = window.prompt("Nhập lý do từ chối sản phẩm");
    if (!reason?.trim()) return;
    try {
      await reportViolationMutation.mutateAsync({ id: product.id, status: "REJECT", reason });
      toast.success("Đã từ chối sản phẩm và tạo hồ sơ vi phạm");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Từ chối sản phẩm thất bại");
    }
  };
  const handleBan = async (product: any) => {
    const reason = window.prompt("Nhập lý do khóa sản phẩm vi phạm");
    if (!reason?.trim()) return;
    try {
      await reportViolationMutation.mutateAsync({ id: product.id, status: "BANNED", reason });
      toast.success("Đã khóa sản phẩm và tạo hồ sơ vi phạm");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khóa sản phẩm thất bại");
    }
  };
  const handleView = (product: any) => {
    setSelected(product);
    setOpen(true);
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateProductMutation.mutateAsync({
            id,
            data: { status: "ACTIVE" },
          }),
        ),
      );
      toast.success("Da duyet cac san pham duoc chon");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Bulk duyet that bai");
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
          <option value="all">Tat ca danh muc</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        <Button disabled={selectedIds.length === 0} onClick={handleBulkApprove}>
          Duyet ({selectedIds.length})
        </Button>
      </div>

      <DataTable
        data={filtered}
        columns={productColumns(handleApprove, handleReject, handleBan, handleView)}
        title="Danh sach san pham"
        onSelectChange={setSelectedIds}
      />

      <ProductPreviewModal open={open} onClose={() => setOpen(false)} product={selected} />
    </main>
  );
}

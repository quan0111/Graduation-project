import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { toast } from "sonner";

import { useProducts } from "../api/get-all-product";
import { useUpdateProduct } from "../api/update-product-id";
import { ProductFilter } from "../component/filter-search-product";
import { productColumns } from "../component/product-collum";
import { ProductPreviewModal } from "../component/product-preview-modal";

export default function ProductsPage() {
  const { data: products = [] } = useProducts();
  const updateProductMutation = useUpdateProduct();

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
          (status === "rejected" && product.status === "REJECT");

        const matchCategory = category === "all" || product.category?.name === category;

        return matchSearch && matchStatus && matchCategory;
      }),
    [category, products, search, status],
  );

  const patchStatus = async (id: number, nextStatus: "ACTIVE" | "REJECT") => {
    try {
      await updateProductMutation.mutateAsync({
        id,
        data: { status: nextStatus },
      });
      toast.success(nextStatus === "ACTIVE" ? "Da duyet san pham" : "Da tu choi san pham");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Cap nhat trang thai that bai");
    }
  };

  const handleApprove = (product: any) => {
    patchStatus(product.id, "ACTIVE");
  };

  const handleReject = (product: any) => {
    patchStatus(product.id, "REJECT");
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
    <main className="flex-1 overflow-auto p-6 w-full">
      <ProductFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        data={products}
      />

      <div className="mb-4">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="all">Tat ca danh muc</option>
          <option value="Thoi trang">Thoi trang</option>
          <option value="Dien tu">Dien tu</option>
          <option value="Nha & Cuoc song">Nha & Cuoc song</option>
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        <Button disabled={selectedIds.length === 0} onClick={handleBulkApprove}>
          Duyet ({selectedIds.length})
        </Button>
      </div>

      <DataTable
        data={filtered}
        columns={productColumns(handleApprove, handleReject, handleView)}
        title="Danh sach san pham"
        onSelectChange={setSelectedIds}
      />

      <ProductPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        product={selected}
      />
    </main>
  );
}

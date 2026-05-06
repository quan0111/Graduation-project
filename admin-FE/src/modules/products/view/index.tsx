import { useProducts } from "../api/get-all-product";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/common/data-table";
import { ProductFilter } from "../component/filter-search-product";
import { productColumns } from "../component/product-collum";
import { ProductPreviewModal } from "../component/product-preview-modal";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const { data: products = [] } = useProducts();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const [sort, setSort] = useState({
    field: "price",
    order: "asc",
  });

  useEffect(() => {
    console.log("fetch API", { sort });
  }, [sort]);

  const filtered = products.filter((p: any) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.shop?.name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      status === "all" ||
      (status === "pending" && p.status === "DRAFT") ||
      (status === "approved" && p.status === "PUBLISHED") ||
      (status === "rejected" && p.status === "REJECTED");

    const matchCategory =
      category === "all" ||
      p.category?.name === category;

    return matchSearch && matchStatus && matchCategory;
  });

  const handleApprove = (p: any) => {
    console.log("approve", p.id);
  };

  const handleReject = (p: any) => {
    console.log("reject", p.id);
  };

  const handleView = (p: any) => {
    setSelected(p);
    setOpen(true);
  };

  const columns = productColumns(
    handleApprove,
    handleReject,
    handleView
  );

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
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">Tất cả danh mục</option>
          <option value="Thời trang">Thời trang</option>
          <option value="Điện tử">Điện tử</option>
          <option value="Nhà & Cuộc sống">Nhà & Cuộc sống</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          disabled={selectedIds.length === 0}
          onClick={() => {
            console.log("bulk approve", selectedIds);
          }}
        >
          Duyệt ({selectedIds.length})
        </Button>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        title="Danh sách sản phẩm"
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
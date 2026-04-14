'use client';

import { useState, useEffect } from "react";
import { DataTable } from "@/components/common/data-table";
import { ProductFilter } from "../component/filter-search-product";
import { productColumns } from "../component/product-collum";
import { ProductPreviewModal } from "../component/product-preview-modal";
import { Button } from "@/components/ui/button";

const PRODUCTS = [
  {
    id: 1,
    name: 'Áo thun nam cao cấp',
    shop: 'Fashion Store Vietnam',
    category: 'Thời trang',
    status: 'pending',
    price: 299000,
    image: '👔',
    rating: 0,
    sales: 0,
    submitDate: '2024-03-27'
  },
  {
    id: 2,
    name: 'Quần jeans nữ',
    shop: 'Fashion Store Vietnam',
    category: 'Thời trang',
    status: 'approved',
    price: 499000,
    image: '👖',
    rating: 4.7,
    sales: 234,
    submitDate: '2024-03-20'
  },
  {
    id: 3,
    name: 'Laptop Gaming RTX 4080',
    shop: 'Electronics Plus',
    category: 'Điện tử',
    status: 'pending',
    price: 49999000,
    image: '💻',
    rating: 0,
    sales: 0,
    submitDate: '2024-03-26'
  },
  {
    id: 4,
    name: 'Đèn LED thông minh',
    shop: 'Home & Living',
    category: 'Nhà & Cuộc sống',
    status: 'rejected',
    price: 199000,
    image: '💡',
    rating: 0,
    sales: 0,
    submitDate: '2024-03-15'
  },
  {
    id: 5,
    name: 'Serum dưỡng da',
    shop: 'Beauty World',
    category: 'Sắc đẹp',
    status: 'approved',
    price: 899000,
    image: '💄',
    rating: 4.9,
    sales: 567,
    submitDate: '2024-03-10'
  }
];


export default function ProductsPage() {
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

  // 🔥 mock backend sort
  useEffect(() => {
    console.log("fetch API", { sort });
  }, [sort]);

  // 🔍 FILTER
  const filtered = PRODUCTS.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shop.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      status === "all" || p.status === status;

    const matchCategory =
      category === "all" || p.category === category;

    return matchSearch && matchStatus && matchCategory;
  });

  // 🔥 ACTIONS
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

  // 🔥 columns inject
  const columns = productColumns(
    handleApprove,
    handleReject,
    handleView
  );

  return (
    <main className="flex-1 overflow-auto p-6 w-full">

      {/* 🔥 FILTER */}
      <ProductFilter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        data={PRODUCTS}
      />

      {/* 🔥 CATEGORY */}
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

      {/* 🔥 BULK ACTION */}
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

      {/* 🔥 TABLE */}
      <DataTable
        data={filtered}
        columns={columns}
        title="Danh sách sản phẩm"
        onSelectChange={setSelectedIds}
      />

      {/* 🔥 MODAL */}
      <ProductPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        product={selected}
      />
    </main>
  );
}
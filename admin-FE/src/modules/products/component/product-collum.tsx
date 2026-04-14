import { ProductStatusBadge } from "./product-badge";
import { ProductActions } from "./product-action";

export const productColumns = (
  onApprove: any,
  onReject: any,
  onView: any
) => [
  {
    key: "name",
    label: "Sản phẩm",
    render: (p: any) => (
      <div className="flex items-center gap-3">
        <span className="text-2xl">{p.image}</span>
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.shop}</p>
        </div>
      </div>
    ),
  },
  { key: "category", label: "Danh mục" },

  {
    key: "price",
    label: "Giá",
    sortable: true,
    render: (p: any) => `${(p.price / 1000).toFixed(0)}K`,
  },

  { key: "sales", label: "Bán", sortable: true },

  {
    key: "rating",
    label: "Đánh giá",
    render: (p: any) =>
      p.rating > 0 ? `⭐ ${p.rating}` : "-",
  },

  {
    key: "status",
    label: "Trạng thái",
    render: (p: any) => (
      <ProductStatusBadge status={p.status} />
    ),
  },

  { key: "submitDate", label: "Ngày gửi" },

  {
    key: "actions",
    label: "Thao tác",
    render: (p: any) => (
      <ProductActions
        product={p}
        onApprove={onApprove}
        onReject={onReject}
        onView={onView}
      />
    ),
  },
];
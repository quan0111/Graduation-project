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
        <span className="text-2xl">📦</span>
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground">
            {p.shop?.name}
          </p>
        </div>
      </div>
    ),
  },

  {
    key: "category",
    label: "Danh mục",
    render: (p: any) => p.category?.name,
  },

  {
    key: "price",
    label: "Giá",
    render: (p: any) => `${(p.price / 1000).toFixed(0)}K`,
  },

  {
    key: "status",
    label: "Trạng thái",
    render: (p: any) => {
      const statusMap: any = {
        DRAFT: "pending",
        ACTIVE: "approved",
        REJECT: "rejected",
      };

      return (
        <ProductStatusBadge status={statusMap[p.status]} />
      );
    },
  },

  {
    key: "submitDate",
    label: "Ngày gửi",
    render: (p: any) =>
      new Date(p.createdAt).toLocaleDateString(),
  },

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

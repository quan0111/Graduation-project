import { ProductActions } from "./product-action";
import { ProductStatusBadge } from "./product-badge";

export const productColumns = (onApprove: any, onReject: any, onBan: any, onView: any) => [
  {
    key: "name",
    label: "San pham",
    render: (product: any) => (
      <div className="flex items-center gap-3">
        <span className="text-2xl">📦</span>
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.shop?.name}</p>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    label: "Danh muc",
    render: (product: any) => product.category?.name,
  },
  {
    key: "price",
    label: "Gia",
    render: (product: any) => new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(product.price || 0)),
  },
  {
    key: "status",
    label: "Trang thai",
    render: (product: any) => {
      const statusMap: Record<string, string> = {
        DRAFT: "pending",
        ACTIVE: "approved",
        REJECT: "rejected",
        BANNED: "banned",
      };
      return <ProductStatusBadge status={statusMap[product.status] ?? "unknown"} />;
    },
  },
  {
    key: "submitDate",
    label: "Ngay gui",
    render: (product: any) => new Date(product.createdAt).toLocaleDateString(),
  },
  {
    key: "actions",
    label: "Thao tac",
    render: (product: any) => (
      <ProductActions
        product={product}
        onApprove={onApprove}
        onReject={onReject}
        onBan={onBan}
        onView={onView}
      />
    ),
  },
];

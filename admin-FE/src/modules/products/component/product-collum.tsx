import { ProductActions } from "./product-action";
import { ProductStatusBadge } from "./product-badge";
import { formatDateTime } from "@/lib/date";

export const productColumns = (onApprove: any, onReject: any, onBan: any, onUnban: any, onView: any) => [
  {
    key: "name",
    label: "Sản phẩm",
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
    label: "Danh mục",
    render: (product: any) => product.category?.name,
  },
  {
    key: "price",
    label: "Giá",
    render: (product: any) => new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(product.price || 0)),
  },
  {
    key: "status",
    label: "Trạng thái",
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
    label: "Ngày gửi",
    render: (product: any) => formatDateTime(product.createdAt),
  },
  {
    key: "actions",
    label: "Thao tác",
    render: (product: any) => (
      <ProductActions
        product={product}
        onApprove={onApprove}
        onReject={onReject}
        onBan={onBan}
        onUnban={onUnban}
        onView={onView}
      />
    ),
  },
];

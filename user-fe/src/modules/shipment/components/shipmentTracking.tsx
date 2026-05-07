import { Truck, Package, CheckCircle, Clock } from "lucide-react";
import type { Shipment } from "../api/get-shipment";

interface ShipmentTrackingProps {
  shipment: Shipment | null;
  isSeller?: boolean;
  onUpdateStatus?: (status: string) => void;
}

const STATUS_CONFIG = {
  READY_TO_SHIP: {
    label: "Chờ giao hàng",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    icon: Clock,
  },
  SHIPPED: {
    label: "Đã giao",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Truck,
  },
  IN_TRANSIT: {
    label: "Đang vận chuyển",
    color: "text-purple-600",
    bg: "bg-purple-50",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao hàng",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle,
  },
};

export const ShipmentTracking: React.FC<ShipmentTrackingProps> = ({
  shipment,
  isSeller = false,
  onUpdateStatus,
}) => {
  if (!shipment) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Theo dõi vận chuyển</h3>
        <p className="text-sm text-slate-500">Chưa có thông tin vận chuyển</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[shipment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.READY_TO_SHIP;
  const StatusIcon = config.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Theo dõi vận chuyển</h3>

      <div className="space-y-4">
        {/* Status Badge */}
        <div className={`flex items-center gap-3 rounded-lg ${config.bg} p-4`}>
          <StatusIcon className={`size-6 ${config.color}`} />
          <div>
            <p className="font-medium text-slate-900">{config.label}</p>
            <p className="text-sm text-slate-500">
              Mã vận đơn: {shipment.trackingNumber || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        {/* Carrier Info */}
        {shipment.carrier && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Truck className="size-5 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Đơn vị vận chuyển</p>
                <p className="text-sm text-slate-500">{shipment.carrier}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Package className="size-3 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Đơn hàng đã được tạo</p>
              <p className="text-xs text-slate-500">
                {new Date(shipment.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {shipment.shippedAt && (
            <div className="flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <Truck className="size-3 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Đã gửi hàng</p>
                <p className="text-xs text-slate-500">
                  {new Date(shipment.shippedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          )}

          {shipment.deliveredAt && (
            <div className="flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="size-3 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Đã giao hàng thành công</p>
                <p className="text-xs text-slate-500">
                  {new Date(shipment.deliveredAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Seller Actions */}
        {isSeller && onUpdateStatus && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Cập nhật trạng thái
            </label>
            <select
              onChange={(e) => onUpdateStatus(e.target.value)}
              value={shipment.status}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="READY_TO_SHIP">Chờ giao hàng</option>
              <option value="SHIPPED">Đã giao</option>
              <option value="IN_TRANSIT">Đang vận chuyển</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

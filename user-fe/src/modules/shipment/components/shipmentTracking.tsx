import { CheckCircle, Clock, MapPin, Package, Truck } from "lucide-react";
import type { ComponentType } from "react";

import { formatDateTime } from "@/lib/date";
import type { Shipment, ShipmentEvent } from "../api/get-shipment";

interface ShipmentTrackingProps {
  shipment: Shipment | null;
  events?: ShipmentEvent[];
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
    label: "Đã gửi hàng",
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
  OUT_FOR_DELIVERY: {
    label: "Đang giao hàng",
    color: "text-violet-600",
    bg: "bg-violet-50",
    icon: Truck,
  },
  DELIVERY_FAILED: {
    label: "Giao thất bại",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: Clock,
  },
  RETURN_TO_SENDER: {
    label: "Hoàn về seller",
    color: "text-orange-600",
    bg: "bg-orange-50",
    icon: Package,
  },
} as const;

const getStatusConfig = (status?: string | null) => {
  const key = String(status ?? "READY_TO_SHIP").toUpperCase() as keyof typeof STATUS_CONFIG;
  return STATUS_CONFIG[key] ?? STATUS_CONFIG.READY_TO_SHIP;
};

const formatEventMessage = (event: ShipmentEvent) => {
  if (event.message) {
    return event.message;
  }
  return getStatusConfig(event.status).label;
};

export const ShipmentTracking: React.FC<ShipmentTrackingProps> = ({
  shipment,
  events = [],
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

  const config = getStatusConfig(shipment.status);
  const StatusIcon = config.icon;
  const visibleEvents = [...events].sort((a, b) => {
    const left = new Date(a.occurredAt ?? a.createdAt ?? 0).getTime();
    const right = new Date(b.occurredAt ?? b.createdAt ?? 0).getTime();
    return right - left;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Theo dõi vận chuyển</h3>

      <div className="space-y-4">
        <div className={`flex items-center gap-3 rounded-lg ${config.bg} p-4`}>
          <StatusIcon className={`size-6 ${config.color}`} />
          <div>
            <p className="font-medium text-slate-900">{config.label}</p>
            <p className="text-sm text-slate-500">
              Mã vận đơn: {shipment.trackingNumber || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        {shipment.carrier ? (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Truck className="size-5 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Đơn vị vận chuyển</p>
                <p className="text-sm text-slate-500">{shipment.carrier}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {visibleEvents.length > 0 ? (
            visibleEvents.map((event) => {
              const eventConfig = getStatusConfig(event.status);
              const EventIcon = eventConfig.icon;
              const time = event.occurredAt ?? event.createdAt;

              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${eventConfig.bg}`}>
                    <EventIcon className={`size-3 ${eventConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{formatEventMessage(event)}</p>
                    {event.location ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="size-3" />
                        {event.location}
                      </p>
                    ) : null}
                    {time ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(time)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <TimelineItem icon={Package} label="Đơn hàng đã được tạo" time={shipment.createdAt} />
              {shipment.shippedAt ? <TimelineItem icon={Truck} label="Đã gửi hàng" time={shipment.shippedAt} tone="blue" /> : null}
              {shipment.deliveredAt ? (
                <TimelineItem icon={CheckCircle} label="Đã giao hàng thành công" time={shipment.deliveredAt} tone="green" />
              ) : null}
            </>
          )}
        </div>

        {isSeller && onUpdateStatus ? (
          <div className="border-t border-slate-200 pt-4">
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Cập nhật trạng thái
            </label>
            <select
              onChange={(event) => onUpdateStatus(event.target.value)}
              value={shipment.status}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="READY_TO_SHIP">Chờ giao hàng</option>
              <option value="SHIPPED">Đã gửi hàng</option>
              <option value="IN_TRANSIT">Đang vận chuyển</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="OUT_FOR_DELIVERY">Đang giao hàng</option>
              <option value="DELIVERY_FAILED">Giao thất bại</option>
              <option value="RETURN_TO_SENDER">Hoàn về seller</option>
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
};

function TimelineItem({
  icon: Icon,
  label,
  time,
  tone = "slate",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  time?: string | null;
  tone?: "slate" | "blue" | "green";
}) {
  const color = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  }[tone];

  return (
    <div className="flex items-start gap-3">
      <div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="size-3" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {time ? <p className="text-xs text-slate-500">{formatDateTime(time)}</p> : null}
      </div>
    </div>
  );
}

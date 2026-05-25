import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, Calendar, MapPin, Shield } from "lucide-react";
import type { IUser } from "../types";
import { RoleBadge, StatusBadge } from "./user-badge";
import { formatDateTime } from "@/lib/date";

interface UserDetailModalProps {
  user: IUser | null;
  open: boolean;
  onClose: () => void;
}

export const UserDetailModal = ({ user, open, onClose }: UserDetailModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar và thông tin cơ bản */}
          <div className="flex items-start gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || "Avatar"}
                className="w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-semibold">
                  {user.fullName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.fullName || "Chưa có tên"}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <RoleBadge role={user.role.toLowerCase()} />
                <StatusBadge status={user.isActive ? "active" : user.deletedAt ? "suspended" : "inactive"} />
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
              </div>
              <p className="ml-6">{user.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Điện thoại:</span>
              </div>
              <p className="ml-6">{user.phone || "Chưa có"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày tham gia:</span>
              </div>
              <p className="ml-6">{formatDateTime(user.createdAt)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Vai trò:</span>
              </div>
              <p className="ml-6">
                <RoleBadge role={user.role.toLowerCase()} />
              </p>
            </div>
          </div>

          {/* Địa chỉ */}
          {user.addresses && user.addresses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Địa chỉ:</span>
              </div>
              <div className="ml-6 space-y-2">
                {user.addresses.map((address) => (
                  <div key={address.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{address.address_line}</p>
                    <p className="text-xs text-muted-foreground">
                      {address.district}, {address.province}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thời gian cập nhật */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Cập nhật lần cuối: {formatDateTime(user.updatedAt)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Lock, LockOpen, Mail, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserFilters } from "../components/filter-search-user";
import { DataTable } from "@/components/common/data-table";
import { RoleBadge, StatusBadge } from "../components/user-badge";
import { UserDetailModal } from "../components/user-detail-modal";
import { useGetUser } from "../api/get-user";
import { useToggleUserStatus } from "../api/update-user";
import { Loader2 } from "lucide-react";
import type { IUser } from "../types";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/date";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: userResponse, isLoading, error } = useGetUser();
  const toggleUserStatus = useToggleUserStatus();

  const handleViewDetail = (user: IUser) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = (user: IUser) => {
    toggleUserStatus.mutate(
      { id: String(user.id), isActive: !user.isActive },
      {
        onSuccess: () => {
          toast.success(user.isActive ? "Đã khóa người dùng" : "Đã mở khóa người dùng");
        },
        onError: () => {
          toast.error("Có lỗi xảy ra khi thay đổi trạng thái");
        },
      }
    );
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Đã copy ${label}`);
    } catch {
      toast.error(`Không thể copy ${label}`);
    }
  };

  const filteredUsers = useMemo(() => {
    let users = userResponse || [];

    // Filter by search term
    if (searchTerm) {
      users = users.filter((u: any) =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (role !== "all") {
      users = users.filter((u: any) => u.role?.toLowerCase() === role);
    }

    // Filter by status
    if (status !== "all") {
      users = users.filter((u: any) => {
        if (status === "active") return u.isActive;
        if (status === "inactive") return !u.isActive && !u.deletedAt;
        if (status === "suspended") return u.deletedAt;
        return true;
      });
    }

    return users;
  }, [userResponse, searchTerm, role, status]);

  const columns = [
    { key: "fullName", label: "Tên" },
    {
      key: "email",
      label: "Email",
      render: (u: any) => <span className="text-xs">{u.email}</span>,
    },
    {
      key: "phone",
      label: "Điện thoại",
      render: (u: any) => <span className="text-xs">{u.phone || "-"}</span>,
    },
    {
      key: "role",
      label: "Vai trò",
      render: (u: any) => <RoleBadge role={u.role?.toLowerCase()} />,
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (u: any) => (
        <StatusBadge status={u.isActive ? "active" : u.deletedAt ? "suspended" : "inactive"} />
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tham gia",
      render: (u: any) => <span className="text-xs">{formatDateTime(u.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (u: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="w-9 h-9 p-0"
            onClick={() => handleViewDetail(u)}
          >
            <Eye className="w-4 h-4" />
          </Button>

          {!u.isActive ? (
            <Button
              size="sm"
              variant="ghost"
              className="w-9 h-9 p-0"
              onClick={() => handleToggleStatus(u)}
            >
              <LockOpen className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="w-9 h-9 p-0"
              onClick={() => handleToggleStatus(u)}
            >
              <Lock className="w-4 h-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size="sm" variant="ghost" className="w-9 h-9 p-0" aria-label="Mở menu thao tác">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewDetail(u)}>
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleToggleStatus(u)}>
                {u.isActive ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                {u.isActive ? "Khóa người dùng" : "Mở khóa người dùng"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleCopy(u.email || "", "email")}>
                <Mail className="w-4 h-4" />
                Copy email
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleCopy(String(u.id), "ID người dùng")}>
                <Copy className="w-4 h-4" />
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Quản lý Người dùng
            </h1>
            <p className="text-muted-foreground">
              Quản lý toàn bộ người dùng hệ thống
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Lỗi tải dữ liệu</p>
              <p className="text-sm">Không thể tải danh sách người dùng. Vui lòng thử lại sau.</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <UserFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterRole={role}
                setFilterRole={setRole}
                filterStatus={status}
                setFilterStatus={setStatus}
              />

              <DataTable
                data={filteredUsers}
                columns={columns}
                title="Danh sách Người dùng"
              />

              <UserDetailModal
                user={selectedUser}
                open={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

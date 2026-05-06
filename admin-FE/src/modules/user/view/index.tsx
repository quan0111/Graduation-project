'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Eye, Shield, LockOpen, MoreVertical } from "lucide-react";
import { UserFilters } from "../components/filter-search-user";
import { DataTable } from "@/components/common/data-table";
import { useFilter } from "@/hooks/use-filter";
import { RoleBadge, StatusBadge } from "../components/user-badge";
const USERS = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0912345678',
    role: 'seller',
    status: 'active',
    joinDate: '2024-01-15',
    orders: 245,
    spent: 12500000
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0987654321',
    role: 'buyer',
    status: 'active',
    joinDate: '2023-11-20',
    orders: 18,
    spent: 3600000
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0923456789',
    role: 'seller',
    status: 'inactive',
    joinDate: '2024-03-01',
    orders: 5,
    spent: 0
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    phone: '0934567890',
    role: 'buyer',
    status: 'active',
    joinDate: '2024-02-10',
    orders: 42,
    spent: 8750000
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    phone: '0945678901',
    role: 'seller',
    status: 'suspended',
    joinDate: '2023-09-05',
    orders: 15,
    spent: 0
  }
];


export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const users = useFilter(USERS, {
    searchTerm,
    searchFields: ["name", "email"],
    filters: { role, status },
  });

  const columns = [
    { key: "name", label: "Tên" },
    {
      key: "email",
      label: "Email",
      render: (u: any) => <span className="text-xs">{u.email}</span>,
    },
    { key: "phone", label: "Điện thoại" },
    {
      key: "role",
      label: "Vai trò",
      render: (u: any) => <RoleBadge role={u.role} />,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (u: any) => <StatusBadge status={u.status} />,
    },
    {
      key: "joinDate",
      label: "Ngày tham gia",
      render: (u: any) => <span className="text-xs">{u.joinDate}</span>,
    },
    { key: "orders", label: "Đơn hàng" },
    {
      key: "spent",
      label: "Chi tiêu",
      render: (u: any) =>
        u.spent > 0 ? `${(u.spent / 1000000).toFixed(1)}M` : "-",
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (u: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
            <Eye className="w-4 h-4" />
          </Button>

          {u.status === "suspended" ? (
            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
              <LockOpen className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
              <Shield className="w-4 h-4" />
            </Button>
          )}

          <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Quản lý Người dùng
            </h1>
            <p className="text-muted-foreground">
              Quản lý toàn bộ người dùng hệ thống
            </p>
          </div>

          {/* Filters */}
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm} 
            filterRole={role}
            setFilterRole={setRole}
            filterStatus={status}
            setFilterStatus={setStatus}
           />

          <DataTable
            data={users}
            columns={columns}
            title="Danh sách Người dùng"
          />
        </div>
      </main>
    </div>
  );
}
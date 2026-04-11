import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export function UserFilters({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
}: any) {
  return (
    <>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Tìm kiếm người dùng, email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {/* Role */}
        <div className="flex gap-2">
          <span className="text-sm font-medium text-muted-foreground self-center">Vai trò:</span>
          {["all", "buyer", "seller"].map(r => (
            <Button
              key={r}
              size="sm"
              variant={filterRole === r ? "default" : "outline"}
              onClick={() => setFilterRole(r)}
            >
              {r === "all" ? "Tất cả" : r === "buyer" ? "Người mua" : "Người bán"}
            </Button>
          ))}
        </div>

        {/* Status */}
        <div className="flex gap-2">
          <span className="text-sm font-medium text-muted-foreground self-center">Trạng thái:</span>
          {["all", "active", "inactive", "suspended"].map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? "default" : "outline"}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all"
                ? "Tất cả"
                : s === "active"
                ? "Hoạt động"
                : s === "inactive"
                ? "Không hoạt động"
                : "Bị khóa"}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
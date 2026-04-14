import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function ProductFilter({
  search,
  setSearch,
  status,
  setStatus,
  data,
}: any) {
  const count = (s: string) =>
    data.filter((p: any) => p.status === s).length;

  return (
    <div className="mb-6 space-y-4">
      
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={status === "all" ? "default" : "outline"} onClick={() => setStatus("all")}>
          Tất cả ({data.length})
        </Button>

        <Button variant={status === "pending" ? "default" : "outline"} onClick={() => setStatus("pending")}>
          Chờ duyệt ({count("pending")})
        </Button>

        <Button variant={status === "approved" ? "default" : "outline"} onClick={() => setStatus("approved")}>
          Đã duyệt ({count("approved")})
        </Button>

        <Button variant={status === "rejected" ? "default" : "outline"} onClick={() => setStatus("rejected")}>
          Từ chối ({count("rejected")})
        </Button>
      </div>
    </div>
  );
}
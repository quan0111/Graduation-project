import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductFilter({
  search,
  setSearch,
  status,
  setStatus,
  data,
}: any) {

  const count = (s: string) => {
    if (s === "pending") return data.filter((p: any) => p.status === "DRAFT").length;
    if (s === "approved") return data.filter((p: any) => p.status === "ACTIVE").length;
    if (s === "rejected") return data.filter((p: any) => p.status === "BANNED").length;
    return data.length;
  };

  return (
    <div className="mb-6 space-y-4">
      
      <div className="flex-1">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductFilter({
  search,
  setSearch,
  status,
  setStatus,
  data,
}: any) {
  const count = (target: string) => {
    if (target === "pending") return data.filter((product: any) => product.status === "DRAFT").length;
    if (target === "approved") return data.filter((product: any) => product.status === "ACTIVE").length;
    if (target === "rejected") return data.filter((product: any) => product.status === "REJECT").length;
    if (target === "banned") return data.filter((product: any) => product.status === "BANNED").length;
    return data.length;
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex-1">
        <Input placeholder="Tìm kiếm sản phẩm..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
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

        <Button variant={status === "banned" ? "default" : "outline"} onClick={() => setStatus("banned")}>
          Cấm bán ({count("banned")})
        </Button>
      </div>
    </div>
  );
}

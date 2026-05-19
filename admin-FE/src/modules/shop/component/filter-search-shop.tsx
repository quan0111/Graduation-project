import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  value: string;
  onChange: (value: string) => void;

  data: any[];
};

export function ShopFilter({
  search,
  onSearchChange,
  value,
  onChange,
  data,
}: Props) {
  const count = (status: string) =>
    data.filter((s) => s.status === status).length;

  return (
    <div className="mb-6 space-y-4">
      
      {/* 🔍 SEARCH */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Tìm kiếm shop, chủ shop..."
            className="pl-10"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* 🎯 FILTER */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={value === "all" ? "default" : "outline"}
          onClick={() => onChange("all")}
        >
          Tất cả ({data.length})
        </Button>

        <Button
          variant={value === "active" ? "default" : "outline"}
          onClick={() => onChange("active")}
        >
          Hoạt động ({count("active")})
        </Button>

        <Button
          variant={value === "suspended" ? "default" : "outline"}
          onClick={() => onChange("suspended")}
        >
          Tạm khóa ({count("suspended")})
        </Button>
      </div>
    </div>
  );
}

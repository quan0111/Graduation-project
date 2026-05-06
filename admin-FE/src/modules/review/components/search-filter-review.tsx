import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function ReviewFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Tìm kiếm đánh giá..."
        className="pl-8 w-64"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
// components/product-detail/ProductTags.tsx
import type { ITag } from "../types";
import { Badge } from "@/components/ui/badge";

export const ProductTags = ({ tags }: { tags?: ITag[] }) => {
  if (!tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((t) => (
        <Badge
          key={t.id}
          className="px-3 py-1 text-xs bg-muted rounded-full hover:bg-primary/10 cursor-pointer"
        >
          #{t.name}
        </Badge>
      ))}
    </div>
  );
};
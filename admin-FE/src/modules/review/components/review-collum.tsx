import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import { RatingStars } from "./rating-star";

import { ReviewBadge } from "./review-badge";

export const reviewColumns = [
  { key: "productName", label: "Sản phẩm" },
  { key: "reviewer", label: "Người đánh giá" },

  {
    key: "rating",
    label: "Sao",
    render: (r: any) => <RatingStars rating={r.rating} />,
    sortable: true,
  },

  { key: "title", label: "Tiêu đề", sortable: true },

  {
    key: "status",
    label: "Trạng thái",
    render: (r: any) => <ReviewBadge status={r.status} />,
    sortable: true,
  },

  { key: "date", label: "Ngày", sortable: true },

  {
    key: "actions",
    label: "Thao tác",
    render: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost">
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
import { Ban, CheckCircle2, Eye, LockOpen, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProductActions({
  product,
  onApprove,
  onReject,
  onBan,
  onUnban,
  onView,
}: any) {
  return (
    <div className="flex gap-2">
      {["DRAFT", "REJECT"].includes(product.status) && (
        <>
          <Button size="sm" onClick={() => onApprove(product)}>
            <CheckCircle2 className="h-4 w-4" />
          </Button>

          <Button size="sm" variant="outline" onClick={() => onReject(product)}>
            <XCircle className="h-4 w-4" />
          </Button>
        </>
      )}

      {product.status === "ACTIVE" && (
        <Button size="sm" variant="destructive" onClick={() => onBan(product)} aria-label="Cấm bán" title="Cấm bán">
          <Ban className="h-4 w-4" />
        </Button>
      )}

      {product.status === "BANNED" && (
        <Button size="sm" onClick={() => onUnban(product)} aria-label="Mở bán lại" title="Mở bán lại">
          <LockOpen className="h-4 w-4" />
        </Button>
      )}

      <Button size="sm" variant="ghost" onClick={() => onView(product)} aria-label="Xem chi tiết" title="Xem chi tiết">
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}

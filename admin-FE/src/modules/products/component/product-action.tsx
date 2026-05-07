import { Ban, CheckCircle2, Eye, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProductActions({
  product,
  onApprove,
  onReject,
  onBan,
  onView,
}: any) {
  return (
    <div className="flex gap-2">
      {product.status === "DRAFT" && (
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
        <Button size="sm" variant="destructive" onClick={() => onBan(product)}>
          <Ban className="h-4 w-4" />
        </Button>
      )}

      <Button size="sm" variant="ghost" onClick={() => onView(product)}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}

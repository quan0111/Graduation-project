import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, XCircle } from "lucide-react";

export function ProductActions({
  product,
  onApprove,
  onReject,
  onView,
}: any) {
  return (
    <div className="flex gap-2">

      {product.status === "DRAFT" && (
        <>
          <Button size="sm" onClick={() => onApprove(product)}>
            <CheckCircle2 className="w-4 h-4" />
          </Button>

          <Button size="sm" variant="outline" onClick={() => onReject(product)}>
            <XCircle className="w-4 h-4" />
          </Button>
        </>
      )}

      <Button size="sm" variant="ghost" onClick={() => onView(product)}>
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );
}

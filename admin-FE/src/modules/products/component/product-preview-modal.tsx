import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductPreviewModal({ open, onClose, product }: any) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p>Shop: {product.shop}</p>
          <p>Giá: {product.price}</p>
          <p>Danh mục: {product.category}</p>
          <p>Trạng thái: {product.status}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
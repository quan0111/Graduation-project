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
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p><b>Shop:</b> {product.shop?.name}</p>
            <p><b>Danh muc:</b> {product.category?.name}</p>
            <p><b>Gia:</b> {product.price?.toLocaleString()} d</p>
            <p><b>Trang thai:</b> {mapStatus(product.status)}</p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Anh san pham</h3>
            <div className="flex flex-wrap gap-2">
              {product.images?.length ? (
                product.images.map((image: any) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt=""
                    className="h-24 w-24 rounded border object-cover"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-400">Khong co anh</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Variants</h3>
            {product.variants?.length ? (
              <div className="space-y-3">
                {product.variants.map((variant: any) => (
                  <div key={variant.id} className="rounded border p-3">
                    <p><b>{variant.name}</b></p>
                    <p>SKU: {variant.sku}</p>
                    <p>Gia: {variant.price?.toLocaleString()} d</p>
                    <p>Stock: {variant.stock}</p>
                    <div className="mt-2 flex gap-2">
                      {variant.images?.length ? (
                        variant.images.map((image: any, index: number) => (
                          <img
                            key={`${variant.id}-${index}`}
                            src={image.url}
                            alt=""
                            className="h-16 w-16 rounded border object-cover"
                          />
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No image</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Khong co variant</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Thuoc tinh</h3>
            {product.attributes?.length ? (
              <ul className="list-disc pl-5">
                {product.attributes.map((attribute: any) => (
                  <li key={attribute.id}>
                    {attribute.key}: {attribute.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Khong co thuoc tinh</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags?.length ? (
                product.tags.map((tag: any) => (
                  <span key={tag.id} className="rounded bg-gray-200 px-2 py-1 text-sm">
                    {tag.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">Khong co tag</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function mapStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Cho duyet";
    case "ACTIVE":
      return "Da duyet";
    case "REJECT":
      return "Tu choi";
    default:
      return status;
  }
}

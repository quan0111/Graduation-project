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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* 🔹 Basic info */}
          <div>
            <p><b>Shop:</b> {product.shop?.name}</p>
            <p><b>Danh mục:</b> {product.category?.name}</p>
            <p><b>Giá:</b> {product.price?.toLocaleString()} đ</p>
            <p><b>Trạng thái:</b> {mapStatus(product.status)}</p>
          </div>

          {/* 🔹 Product Images */}
          <div>
            <h3 className="font-semibold mb-2">Ảnh sản phẩm</h3>
            <div className="flex gap-2 flex-wrap">
              {product.images?.length ? (
                product.images.map((img: any) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-400">Không có ảnh</p>
              )}
            </div>
          </div>

          {/* 🔹 Variants */}
          <div>
            <h3 className="font-semibold mb-2">Variants</h3>

            {product.variants?.length ? (
              <div className="space-y-3">
                {product.variants.map((v: any) => (
                  <div key={v.id} className="border p-3 rounded">

                    <p><b>{v.name}</b></p>
                    <p>SKU: {v.sku}</p>
                    <p>Giá: {v.price?.toLocaleString()} đ</p>
                    <p>Stock: {v.stock}</p>

                    {/* Variant Images */}
                    <div className="flex gap-2 mt-2">
                      {v.images?.length ? (
                        v.images.map((img: any, idx: number) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt=""
                            className="w-16 h-16 object-cover rounded border"
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
              <p className="text-sm text-gray-400">Không có variant</p>
            )}
          </div>

          {/* 🔹 Attributes */}
          <div>
            <h3 className="font-semibold mb-2">Thuộc tính</h3>

            {product.attributes?.length ? (
              <ul className="list-disc pl-5">
                {product.attributes.map((attr: any) => (
                  <li key={attr.id}>
                    {attr.key}: {attr.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Không có thuộc tính</p>
            )}
          </div>

          {/* 🔹 Tags */}
          <div>
            <h3 className="font-semibold mb-2">Tags</h3>

            <div className="flex gap-2 flex-wrap">
              {product.tags?.length ? (
                product.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">Không có tag</p>
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
      return "Chờ duyệt";
    case "PUBLISHED":
      return "Đã duyệt";
    case "REJECTED":
      return "Từ chối";
    default:
      return status;
  }
}
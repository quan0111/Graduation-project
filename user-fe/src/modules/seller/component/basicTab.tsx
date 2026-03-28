import { Input } from '@/components/ui/input';

export function ProductBasicTab({
  productName,
  setProductName,
  category,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">
          Tên sản phẩm *
        </label>
        <Input
          value={productName}
          onChange={e => setProductName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Ngành hàng *
        </label>
        <div className="p-3 border rounded-lg">{category}</div>
      </div>
    </div>
  );
}
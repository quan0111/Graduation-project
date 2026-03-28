import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VariantTable } from './variantTable';

export function ProductSellingTab({ variants, removeVariant }: any) {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3>Thông tin bán hàng</h3>
        <Button size="sm">
          <Plus size={16} /> Thêm
        </Button>
      </div>

      <VariantTable
        variants={variants}
        removeVariant={removeVariant}
      />
    </div>
  );
}
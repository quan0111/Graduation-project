import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export function ProductImages() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Hình ảnh sản phẩm</h3>

      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
          >
            <div className="text-center">
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">Ảnh {i}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
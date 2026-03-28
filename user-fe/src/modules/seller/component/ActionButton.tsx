import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ProductActions() {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <Link href="/seller/products">
        <Button variant="outline">Hủy</Button>
      </Link>
      <Button>Lưu</Button>
    </div>
  );
}
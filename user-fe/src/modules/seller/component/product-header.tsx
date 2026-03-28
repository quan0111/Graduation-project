import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export function ProductHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link to="/seller/products" className="p-2 hover:bg-muted rounded-lg">
        <ChevronDown className="rotate-90" size={20} />
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Thêm sản phẩm mới</h1>
        <p className="text-muted-foreground">
          Điền đầy đủ thông tin sản phẩm để đăng bán
        </p>
      </div>
    </div>
  );
}
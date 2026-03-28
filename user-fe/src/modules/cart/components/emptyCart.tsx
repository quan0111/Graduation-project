// sections/EmptyCart.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const EmptyCart = () => (
  <div className="text-center py-20">
    <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
    <Link href="/products">
      <Button>Tiếp tục mua</Button>
    </Link>
  </div>
);
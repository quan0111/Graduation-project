// sections/OrderActions.tsx
import { Button } from "@/components/ui/button";

export const OrderActions = () => {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <Button variant="outline">Tải hóa đơn</Button>
      <Button variant="outline">Liên hệ</Button>
      <Button className="bg-accent">Mua lại</Button>
    </div>
  );
};
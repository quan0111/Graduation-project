// components/Newsletter.tsx
import { Button } from "@/components/ui/button";

export const Newsletter = () => {
  return (
    <section className="bg-primary text-white py-12 text-center">
      <h2 className="text-2xl mb-4">
        Nhận khuyến mãi
      </h2>

      <div className="flex justify-center gap-2">
        <input className="px-3 py-2 text-black rounded" />
        <Button>Đăng ký</Button>
      </div>
    </section>
  );
};
import type { IProduct } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAddItem } from "@/modules/cart/api/add-item";
import { toast } from "sonner";

const getAvgRating = (reviews?: any[]) => {
  if (!reviews?.length) return 0;
  return (
    reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
    reviews.length
  );
};

export const ProductCard = ({ product }: { product: IProduct }) => {
  const avgRating = getAvgRating(product.reviews);
  const addMutation = useAddItem();

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync({
        productId: product.id,
        variantId: product.variants?.[0]?.id ?? null, // 🔥 lấy variant đầu tiên nếu có
        quantity: 1,
      });

      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.error(err);
      toast.error("Thêm thất bại");
    }
  };

  return (
    <Card className="group hover:shadow-xl transition">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.images?.[0]?.url || "/placeholder.png"}
          className="w-full h-full object-cover group-hover:scale-110 transition"
        />
      </div>

      <CardContent>
        <p className="text-lg font-bold text-primary">
          {product.shop?.name || "Unknown shop"}
        </p>

        <h3 className="line-clamp-2 font-semibold">
          {product.name}
        </h3>

        <div className="text-sm text-yellow-500">
          {avgRating.toFixed(1)} ({product.reviews?.length || 0})
        </div>

        <div className="flex gap-2 items-center mt-2 justify-center">
          <span className="text-primary font-bold text-lg">
            {product.price.toLocaleString()}đ
          </span>
        </div>

        <Button
          className="w-full mt-2"
          onClick={handleAdd}
          disabled={addMutation.isPending}
        >
          {addMutation.isPending ? "Đang thêm..." : "Thêm"}
        </Button>
      </CardContent>
    </Card>
  );
};
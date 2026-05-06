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
  const addMutation = useAddItem();

  const handleAdd = async () => {
    if (!product.shop?.id) {
      toast.error("Thiếu shopId");
      return;
    }

    try {
      await addMutation.mutateAsync({
        productId: product.id,
        variantId: product.variants?.[0]?.id ?? null,
        shopId: product.shop.id,
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
      <div className="aspect-square overflow-hidden">
        <img
          src={product.images?.[0]?.url || "/placeholder.png"}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent>
        <p className="text-lg font-bold text-primary">
          {product.shop?.name || "Unknown shop"}
        </p>

        <h3 className="line-clamp-2 font-semibold">
          {product.name}
        </h3>

        <span className="text-primary font-bold">
          {product.price.toLocaleString()}đ
        </span>

        <Button
          className="w-full mt-2"
          onClick={handleAdd}
        >
          {addMutation.isPending ? "Đang thêm..." : "Thêm"}
        </Button>
      </CardContent>
    </Card>
  );
};
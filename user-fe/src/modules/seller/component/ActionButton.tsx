import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateProduct } from "../api/product";
import { useGetShopByOwnerId } from "@/modules/shop/api/shop";
import { toast } from "sonner";

interface ProductActionsProps {
  formData?: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    images: string[];
  };
}

export function ProductActions({ formData }: ProductActionsProps) {
  const navigate = useNavigate();
  const { data: shop } = useGetShopByOwnerId();
  const createProductMutation = useCreateProduct();

  const handleSave = async () => {
    if (!shop) {
      toast.error("Vui lòng tạo shop trước");
      return;
    }

    if (!formData) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!formData.name || !formData.description || !formData.price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category_id: formData.category_id,
        shop_id: shop.id,
        images: formData.images,
      });

      toast.success("Tạo sản phẩm thành công!");
      navigate("/seller/products");
    } catch (error) {
      toast.error("Tạo sản phẩm thất bại");
      console.error(error);
    }
  };

  return (
    <div className="flex justify-end gap-3 mt-6">
      <Button variant="outline" onClick={() => navigate("/seller/products")}>
        Hủy
      </Button>
      <Button 
        onClick={handleSave} 
        disabled={createProductMutation.isPending}
      >
        {createProductMutation.isPending ? "Đang lưu..." : "Lưu"}
      </Button>
    </div>
  );
}
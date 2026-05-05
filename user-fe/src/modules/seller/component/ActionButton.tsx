import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateProduct } from "@/modules/product/api/add-product";
import { useGetShopByOwnerId } from "@/modules/shop/api/shop";
import { toast } from "sonner";

interface ProductActionsProps {
  formData?: {
    name: string;
    description: string;
    category_id: number;
    images: string[];

    attributes?: {
      name: string;
      values: string[];
    }[];

    variants?: {
      price: number;
      stock: number;
      attributes: Record<string, string>;
      weight?: number;
      length?: number;
    }[];
  };
}

export function ProductActions({ formData }: ProductActionsProps) {
  const navigate = useNavigate();
  const { data: shop } = useGetShopByOwnerId();
  const createProductMutation = useCreateProduct();

  const handleSave = async () => {
    // ================= VALIDATE =================

    if (!shop) {
      toast.error("Vui lòng tạo shop trước");
      return;
    }

    if (!formData) {
      toast.error("Thiếu dữ liệu");
      return;
    }

    if (!formData.name) {
      toast.error("Thiếu tên sản phẩm");
      return;
    }

    if (!formData.description) {
      toast.error("Thiếu mô tả");
      return;
    }

    if (!formData.images || formData.images.length < 3) {
      toast.error("Cần ít nhất 3 ảnh");
      return;
    }

    if (!formData.category_id) {
      toast.error("Chưa chọn category");
      return;
    }

    // ===== VALIDATE VARIANT =====
    if (formData.attributes?.length && !formData.variants?.length) {
      toast.error("Bạn phải tạo variant");
      return;
    }

    if (formData.variants?.length) {
      const prices = formData.variants.map(v => v.price);
      const max = Math.max(...prices);
      const min = Math.min(...prices);

      if (min > 0 && max / min > 5) {
        toast.error("Giá không được lệch quá 5 lần");
        return;
      }
    }

    try {
      // ================= BUILD PAYLOAD =================

      const firstVariant = formData.variants?.[0];
      const payload = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        shop_id: shop.id,
        price: firstVariant?.price || 0,
        stock: firstVariant?.stock || 0,
        status: "active",

        // 👇 images
        images: formData.images,

        // 👇 FIX attributes (BE cần key/value)
        attributes: (formData.attributes || []).flatMap(attr =>
          attr.values.map(value => ({
            key: attr.name,
            value,
          }))
        ),

        // 👇 FIX variants (BE cần name)
        variants: (formData.variants || []).map(v => ({
          name: Object.values(v.attributes).join(" - "),
          price: v.price,
          stock: v.stock,
          weight: v.weight || 0,
        })),
      };

      console.log("🚀 FINAL PAYLOAD", payload);

      await createProductMutation.mutateAsync(payload as any);

      toast.success("Tạo sản phẩm thành công!");
      navigate("/seller/products");

    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Tạo sản phẩm thất bại"
      );
    }
  };

  return (
    <div className="flex justify-end gap-3 mt-6">
      <Button
        variant="outline"
        onClick={() => navigate("/seller/products")}
      >
        Hủy
      </Button>

      <Button
        onClick={handleSave}
        disabled={createProductMutation.isPending}
      >
        {createProductMutation.isPending
          ? "Đang lưu..."
          : "Lưu sản phẩm"}
      </Button>
    </div>
  );
}
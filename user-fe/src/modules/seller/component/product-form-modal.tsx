import { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { useCreateProduct } from "@/modules/seller/api/create-product";
import { useUpdateProduct } from "@/modules/seller/api/update-product";
import { CategoryPicker } from "@/modules/seller/component/add-product/categoryPicker";
import type { Category } from "@/modules/seller/types/addproduct";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
}

export const ProductFormModal = ({ isOpen, onClose, onSuccess, product }: ProductFormModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    sku: "",
    category_id: "",
    images: [] as File[],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["seller", "categories"],
    queryFn: async () => {
      const response = await apiClient.get("/categories");
      return response.data;
    },
  });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        sku: product.sku || "",
        category_id: product.category_id?.toString() || product.categoryId?.toString() || "",
        images: [],
      });
      if (product.images) {
        setImagePreviews(product.images.map((img: any) => img.url));
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        sku: "",
        category_id: "",
        images: [],
      });
      setImagePreviews([]);
    }
  }, [product, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} không phải là ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá 5MB`);
        return false;
      }
      return true;
    });

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...validFiles] }));

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      toast.error("Vui lòng điền các trường bắt buộc");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      if (formData.sku) formDataToSend.append("sku", formData.sku);
      if (formData.category_id) formDataToSend.append("category_id", formData.category_id);
      
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      if (product) {
        await updateMutation.mutateAsync({ id: product.id, data: formDataToSend });
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await createMutation.mutateAsync(formDataToSend);
        toast.success("Thêm sản phẩm thành công");
      }
      
      onSuccess();
    } catch (error) {
      toast.error(product ? "Không thể cập nhật sản phẩm" : "Không thể thêm sản phẩm");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tên sản phẩm *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Mô tả</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả sản phẩm"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Giá *</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Kho hàng *</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Mã sản phẩm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Danh mục</label>
              <CategoryPicker
                categories={categories}
                value={formData.category_id ? Number(formData.category_id) : ""}
                onChange={(value) => setFormData({ ...formData, category_id: value ? String(value) : "" })}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Hình ảnh (tối đa 5 ảnh)</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-upload"
                />
                <label
                  htmlFor="product-image-upload"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-600">Chọn ảnh</span>
                </label>
                <span className="text-sm text-slate-500">{formData.images.length + imagePreviews.filter(p => !p.startsWith('data:')).length}/5</span>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline">
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-[#ee4d2d] hover:bg-[#d93f21]"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Đang xử lý..." : product ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

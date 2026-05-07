import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { ProductFormModal } from "@/modules/seller/component/product-form-modal";
import { useSellerProducts } from "@/modules/seller/api/get-seller-products";
import { useDeleteProduct } from "@/modules/seller/api/delete-product";

export default function SellerProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const { data: products = [], isLoading, refetch } = useSellerProducts();
  const deleteMutation = useDeleteProduct();

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && product.is_active) ||
      (filterStatus === "inactive" && !product.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (productId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await deleteMutation.mutateAsync(productId);
      toast.success("Xóa sản phẩm thành công");
      refetch();
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
  };

  const handleSuccess = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    refetch();
  };

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>
            <p className="text-sm text-slate-500 mt-1">Quản lý danh sách sản phẩm của shop</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm mới
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              Tất cả
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              onClick={() => setFilterStatus("active")}
              size="sm"
            >
              Đang bán
            </Button>
            <Button
              variant={filterStatus === "inactive" ? "default" : "outline"}
              onClick={() => setFilterStatus("inactive")}
              size="sm"
            >
              Ngừng bán
            </Button>
          </div>
        </div>

        {/* Product List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Đang tải sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">Chưa có sản phẩm nào</p>
            <Button onClick={() => setShowAddModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm đầu tiên
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Sản phẩm</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Giá</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Kho</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Đã bán</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Trạng thái</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">SKU: {product.sku || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(product.price)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{product.stock || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{product.sold_count || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {product.is_active ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <ProductFormModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={handleSuccess}
          />
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <ProductFormModal
            isOpen={!!editingProduct}
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </SellerDashboardLayout>
  );
}

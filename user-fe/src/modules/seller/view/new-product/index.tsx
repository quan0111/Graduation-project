import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldAlert,
  Store,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useMe } from "@/modules/auth/api/get-auth-me";
import { useCreateProduct } from "@/modules/product/api/add-product";
import { useGetShopByOwnerId } from "@/modules/shop/api/myshop";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useUploadImage } from "@/modules/upload/api/upload-image";
import { apiClient } from "@/lib/api";

import { AccessCard } from "../../component/add-product/accessCard";
import { DetailStep } from "../../component/add-product/detailStep";
import { MediaStep } from "../../component/add-product/mediaStep";
import { SellingStep } from "../../component/add-product/sellingStep";
import { ShippingStep } from "../../component/add-product/shippingStep";
import { StepSidebar } from "../../component/add-product/stepSideBar";
import { useDetailState } from "../../hooks/useDetailState";
import { useMediaState } from "../../hooks/useMediaState";
import { useSellingState } from "../../hooks/useSellingState";
import { useShippingState } from "../../hooks/useShippingState";
import { useStepState } from "../../hooks/useStepState";
import { slugify } from "../../utils/addproduct";
import type { Category } from "../../types/addproduct";

export default function AddProductPage() {
  const navigate = useNavigate();

  const { data: user, isLoading: isUserLoading } = useMe();
  const { data: shop, isLoading: isShopLoading } = useGetShopByOwnerId({
    enabled: user?.role === "SELLER",
    retry: false,
    throwOnError: false as never,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["seller", "categories"],
    queryFn: async () => {
      const response = await apiClient.get("/categories");
      return response.data;
    },
  });

  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutateAsync: createProduct, isPending: isSubmitting } = useCreateProduct();

  // Use custom hooks to split state management for better performance
  const mediaState = useMediaState(uploadImage);
  const detailState = useDetailState();
  const sellingState = useSellingState(mediaState.images);
  const shippingState = useShippingState();

  const handleUploadVariantImage = useCallback(
    async (index: number, file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ hỗ trợ upload file ảnh cho phân loại.");
        return;
      }

      try {
        const uploaded = await uploadImage({ file, folder: "products" });
        sellingState.updateVariant(index, "imageUrl", uploaded.url);
        toast.success("Đã upload ảnh phân loại");
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Không upload được ảnh phân loại");
      }
    },
    [sellingState.updateVariant, uploadImage],
  );

  const allErrorsByStep = useMemo(
    () => ({
      media: mediaState.mediaErrors,
      detail: detailState.detailErrors,
      selling: sellingState.sellingErrors,
      shipping: [] as string[],
    }),
    [mediaState.mediaErrors, detailState.detailErrors, sellingState.sellingErrors],
  );

  const stepState = useStepState(allErrorsByStep);

  const handleSubmit = useCallback(async () => {
    const finalErrors = [...mediaState.mediaErrors, ...detailState.detailErrors, ...sellingState.sellingErrors];
    if (finalErrors.length > 0) {
      toast.error(finalErrors[0]);
      return;
    }

    try {
      await createProduct({
        name: mediaState.name.trim(),
        slug: slugify(mediaState.name),
        categoryId: Number(mediaState.categoryId),
        description: detailState.description.trim(),
        images: mediaState.images.map((image, index) => ({
          url: image.url,
          position: index + 1,
          isPrimary: index === 0,
        })),
        attributes: detailState.filteredAttributes,
        variants: sellingState.variants.map((variant, index) => ({
          name: variant.name,
          sku: variant.sku || `SKU-${slugify(mediaState.name).toUpperCase()}-${index + 1}`,
          price: variant.price,
          stock: variant.stock,
          weight:
            shippingState.shipping.weightMode === "per-variant"
              ? variant.weight
              : Number(shippingState.shipping.packageWeight || 0),
          images: variant.imageUrl
            ? [
                {
                  url: variant.imageUrl,
                  position: 1,
                },
              ]
            : [],
        })),
      });

      toast.success("San pham da gui len admin o trang thai draft");
      navigate("/seller/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Khong tao duoc san pham");
    }
  }, [
    mediaState,
    detailState,
    sellingState,
    shippingState,
    createProduct,
    navigate,
  ]);

  if (isUserLoading || (user?.role === "SELLER" && isShopLoading)) {
    return (
      <SellerDashboardLayout>
        <div className="rounded-3xl border bg-white p-8">Dang tai...</div>
      </SellerDashboardLayout>
    );
  }

  if (!user) {
    return (
      <SellerDashboardLayout>
        <AccessCard
          icon={<ShieldAlert className="size-6" />}
          title="Không có quyền truy cập"
          description="Bạn cần đăng nhập trước khi mở shop."
          primaryLabel="Dang nhap"
          primaryHref="/login"
        />
      </SellerDashboardLayout>
    );
  }

  if (user.role !== "SELLER" || !shop) {
    return (
      <SellerDashboardLayout>
        <AccessCard
          icon={<Store className="size-6" />}
          title="tài khoản chưa có quyền seller"
          description="Hãy gửi yêu cầu trở thành người bán. Sau khi được phê duyệt, bạn sẽ vào seller dashboard và có thể thêm sản phẩm."
          primaryLabel="Mở shop ngay"
          primaryHref="/seller"
        />
      </SellerDashboardLayout>
    );
  }

  return (
    <SellerDashboardLayout>
      <div className="space-y-6">
        <section className="rounded-4xl bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_44%,#ffedd5_100%)] p-6 shadow-sm ring-1 ring-orange-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-orange-700">
                <Package className="size-3.5" />
                Seller Product Wizard
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Thêm sản phẩm mới</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Nhập từng bước giống như đăng sản phẩm của sàn thương mại: hình ảnh, chi tiết, phân loại bán hàng và vận chuyển.
                Khi submit, sản phẩm sẽ được gửi lên admin ở trạng thái draft để phê duyệt.
              </p>
            </div>

            <div className="rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-orange-100">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Shop hiện tại</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{shop.name}</p>
              <p className="text-sm text-slate-500">Chủ shop: {user.fullName || user.email}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
          <StepSidebar
            currentStep={stepState.currentStep}
            currentStepIndex={stepState.currentStepIndex}
            onStepChange={stepState.setCurrentStep}
            canNavigateTo={stepState.canNavigateTo}
          />

          <div className="space-y-6">
            {stepState.currentStep === "media" && (
              <MediaStep
                name={mediaState.name}
                categoryId={mediaState.categoryId}
                images={mediaState.images}
                categories={categories}
                mediaErrors={mediaState.mediaErrors}
                isUploading={isUploading}
                onNameChange={mediaState.setName}
                onCategoryChange={mediaState.setCategoryId}
                onUploadFiles={mediaState.handleUploadFiles}
                onSetCoverImage={mediaState.setCoverImage}
                onRemoveImage={mediaState.removeImage}
              />
            )}

            {stepState.currentStep === "detail" && (
              <DetailStep
                attributes={detailState.attributes}
                description={detailState.description}
                detailErrors={detailState.detailErrors}
                onUpdateAttribute={detailState.updateAttribute}
                onAddAttribute={detailState.addAttribute}
                onRemoveAttribute={detailState.removeAttribute}
                onDescriptionChange={detailState.setDescription}
              />
            )}

            {stepState.currentStep === "selling" && (
              <SellingStep
                variantGroups={sellingState.variantGroups}
                variants={sellingState.variants}
                images={mediaState.images}
                sellingErrors={sellingState.sellingErrors}
                isUploadingVariantImage={isUploading}
                onUpdateGroupName={sellingState.updateGroupName}
                onUpdateGroupValue={sellingState.updateGroupValue}
                onAddGroup={sellingState.addGroup}
                onAddGroupValue={sellingState.addGroupValue}
                onRemoveGroup={sellingState.removeGroup}
                onRemoveGroupValue={sellingState.removeGroupValue}
                onGenerateVariants={sellingState.generateVariants}
                onUpdateVariant={sellingState.updateVariant}
                onUploadVariantImage={handleUploadVariantImage}
              />
            )}

            {stepState.currentStep === "shipping" && (
              <ShippingStep
                shipping={shippingState.shipping}
                onShippingChange={shippingState.setShipping}
              />
            )}

            <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                {stepState.currentStep === "shipping"
                  ? "Khi bam Gui duyet, san pham se len admin voi trang thai draft."
                  : "Chi khi validate dat yeu cau thi moi sang duoc buoc tiep theo."}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" disabled={stepState.currentStepIndex === 0} onClick={stepState.goPrev}>
                  <ChevronLeft className="size-4" />
                  Quay lai
                </Button>

                {stepState.currentStep !== "shipping" ? (
                  <Button onClick={stepState.goNext}>
                    Tiep theo
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button disabled={isSubmitting || isUploading} onClick={handleSubmit}>
                    <Truck className="size-4" />
                    {isSubmitting ? "Dang gui duyet..." : "Gui admin duyet"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

import { useState } from "react";
import { toast } from "sonner";

import {
  useAddFlashSaleItemsBulk,
  useAdminBanners,
  useCreateBanner,
  useCreateFlashSale,
  useFlashSales,
  useUpdateFlashSale,
} from "../api/marketing";
import { BannerCreateDialog } from "../components/banner-create-dialog";
import { BannerListCard } from "../components/banner-list-card";
import { FlashSaleCreateDialog } from "../components/flash-sale-create-dialog";
import { FlashSaleItemDialog } from "../components/flash-sale-item-dialog";
import { FlashSaleListCard } from "../components/flash-sale-list-card";
import type {
  BannerCreatePayload,
  FlashSale,
  FlashSaleBulkItemCreatePayload,
  FlashSaleCreatePayload,
  FlashSaleStatus,
} from "../types";
import { getApiErrorMessage } from "../utils/error";

const COPY = {
  title: "Marketing",
  description: "Quản lý banner và flash sale hệ thống.",
  bannerCreated: "Tạo banner thành công.",
  bannerCreateFailed: "Tạo banner thất bại.",
  flashSaleCreated: "Tạo flash sale thành công.",
  flashSaleCreateFailed: "Tạo flash sale thất bại.",
  flashSaleUpdated: "Cập nhật flash sale thành công.",
  flashSaleUpdateFailed: "Cập nhật flash sale thất bại.",
  flashSaleItemAdded: "Thêm sản phẩm flash sale thành công.",
  flashSaleItemAddedWithSkipped:
    "Thêm flash sale thành công, một số sản phẩm bị bỏ qua.",
  flashSaleItemAddFailed: "Thêm sản phẩm flash sale thất bại.",
};

export default function MarketingPage() {
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [flashSaleDialogOpen, setFlashSaleDialogOpen] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale | null>(null);

  const bannersQuery = useAdminBanners();
  const flashSalesQuery = useFlashSales();
  const createBannerMutation = useCreateBanner();
  const createFlashSaleMutation = useCreateFlashSale();
  const updateFlashSaleMutation = useUpdateFlashSale();
  const addFlashSaleItemsBulkMutation = useAddFlashSaleItemsBulk();

  const banners = bannersQuery.data ?? [];
  const flashSales = flashSalesQuery.data ?? [];

  const handleCreateBanner = async (payload: BannerCreatePayload) => {
    try {
      await createBannerMutation.mutateAsync(payload);
      toast.success(COPY.bannerCreated);
      setBannerDialogOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, COPY.bannerCreateFailed));
      throw error;
    }
  };

  const handleCreateFlashSale = async (payload: FlashSaleCreatePayload) => {
    try {
      await createFlashSaleMutation.mutateAsync(payload);
      toast.success(COPY.flashSaleCreated);
      setFlashSaleDialogOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, COPY.flashSaleCreateFailed));
      throw error;
    }
  };

  const handleToggleFlashSaleStatus = async (sale: FlashSale) => {
    const nextStatus: FlashSaleStatus = sale.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

    try {
      await updateFlashSaleMutation.mutateAsync({
        id: sale.id,
        payload: { status: nextStatus },
      });
      toast.success(COPY.flashSaleUpdated);
    } catch (error) {
      toast.error(getApiErrorMessage(error, COPY.flashSaleUpdateFailed));
    }
  };

  const handleAddFlashSaleItems = async (payload: FlashSaleBulkItemCreatePayload) => {
    if (!selectedFlashSale) {
      return;
    }

    try {
      const result = await addFlashSaleItemsBulkMutation.mutateAsync({
        saleId: selectedFlashSale.id,
        payload,
      });
      const message =
        result.skipped > 0
          ? `${COPY.flashSaleItemAddedWithSkipped} (${result.created} thêm, ${result.updated} cập nhật, ${result.skipped} bỏ qua)`
          : `${COPY.flashSaleItemAdded} (${result.created} thêm, ${result.updated} cập nhật)`;
      toast.success(message);
      setSelectedFlashSale(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, COPY.flashSaleItemAddFailed));
      throw error;
    }
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{COPY.title}</h1>
        <p className="text-muted-foreground">{COPY.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BannerListCard
          banners={banners}
          isError={bannersQuery.isError}
          isLoading={bannersQuery.isLoading}
          pending={createBannerMutation.isPending}
          onCreate={() => setBannerDialogOpen(true)}
        />

        <FlashSaleListCard
          flashSales={flashSales}
          addingItem={addFlashSaleItemsBulkMutation.isPending}
          isError={flashSalesQuery.isError}
          isLoading={flashSalesQuery.isLoading}
          pending={createFlashSaleMutation.isPending}
          updating={updateFlashSaleMutation.isPending}
          onAddItem={setSelectedFlashSale}
          onCreate={() => setFlashSaleDialogOpen(true)}
          onToggleStatus={handleToggleFlashSaleStatus}
        />
      </div>

      <BannerCreateDialog
        open={bannerDialogOpen}
        pending={createBannerMutation.isPending}
        onOpenChange={setBannerDialogOpen}
        onSubmit={handleCreateBanner}
      />
      <FlashSaleCreateDialog
        open={flashSaleDialogOpen}
        pending={createFlashSaleMutation.isPending}
        onOpenChange={setFlashSaleDialogOpen}
        onSubmit={handleCreateFlashSale}
      />
      <FlashSaleItemDialog
        sale={selectedFlashSale}
        pending={addFlashSaleItemsBulkMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFlashSale(null);
          }
        }}
        onSubmit={handleAddFlashSaleItems}
      />
    </main>
  );
}

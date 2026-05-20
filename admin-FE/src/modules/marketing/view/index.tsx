import { useState } from "react";
import { toast } from "sonner";

import {
  useAddFlashSaleItem,
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
  FlashSaleCreatePayload,
  FlashSaleItemCreatePayload,
  FlashSaleStatus,
} from "../types";
import { getApiErrorMessage } from "../utils/error";

const COPY = {
  title: "Marketing",
  description: "Qu\u1ea3n l\u00fd banner v\u00e0 flash sale h\u1ec7 th\u1ed1ng.",
  bannerCreated: "T\u1ea1o banner th\u00e0nh c\u00f4ng.",
  bannerCreateFailed: "T\u1ea1o banner th\u1ea5t b\u1ea1i.",
  flashSaleCreated: "T\u1ea1o flash sale th\u00e0nh c\u00f4ng.",
  flashSaleCreateFailed: "T\u1ea1o flash sale th\u1ea5t b\u1ea1i.",
  flashSaleUpdated: "C\u1eadp nh\u1eadt flash sale th\u00e0nh c\u00f4ng.",
  flashSaleUpdateFailed: "C\u1eadp nh\u1eadt flash sale th\u1ea5t b\u1ea1i.",
  flashSaleItemAdded: "Th\u00eam s\u1ea3n ph\u1ea9m flash sale th\u00e0nh c\u00f4ng.",
  flashSaleItemAddFailed: "Th\u00eam s\u1ea3n ph\u1ea9m flash sale th\u1ea5t b\u1ea1i.",
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
  const addFlashSaleItemMutation = useAddFlashSaleItem();

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

  const handleAddFlashSaleItem = async (payload: FlashSaleItemCreatePayload) => {
    if (!selectedFlashSale) {
      return;
    }

    try {
      await addFlashSaleItemMutation.mutateAsync({
        saleId: selectedFlashSale.id,
        payload,
      });
      toast.success(COPY.flashSaleItemAdded);
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
          addingItem={addFlashSaleItemMutation.isPending}
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
        pending={addFlashSaleItemMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFlashSale(null);
          }
        }}
        onSubmit={handleAddFlashSaleItem}
      />
    </main>
  );
}

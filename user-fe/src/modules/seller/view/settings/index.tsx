import { type ReactNode, useEffect, useState } from "react";
import { Camera, KeyRound, Settings, Store, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetShopByOwnerId, useUpdateMyShop } from "@/modules/shop/api/myshop";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useUploadImage } from "@/modules/upload/api/upload-image";
import { useChangePassword, useGetCurrentUser, useUpdateProfile } from "@/modules/user/api/user";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SellerSettingsPage() {
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUser();
  const { data: shop, isLoading: isLoadingShop } = useGetShopByOwnerId({ retry: false });
  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProfile();
  const { mutateAsync: updateMyShop, isPending: isSavingShop } = useUpdateMyShop();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImage();
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    avatarUrl: "",
  });
  const [shopForm, setShopForm] = useState({
    name: "",
    slug: "",
    description: "",
    avatarUrl: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  useEffect(() => {
    if (!shop) return;
    setShopForm({
      name: shop.name || "",
      slug: shop.slug || "",
      description: shop.description || "",
      avatarUrl: shop.avatarUrl || "",
    });
  }, [shop]);

  const handleUpload = async (file: File | undefined, folder: string, onDone: (url: string) => void) => {
    if (!file) return;
    try {
      const result = await uploadImage({ file, folder });
      onDone(result.url);
      toast.success("Đã tải ảnh lên");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được ảnh");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      toast.success("Đã lưu hồ sơ seller");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được hồ sơ");
    }
  };

  const handleSaveShop = async () => {
    try {
      await updateMyShop(shopForm);
      toast.success("Đã lưu cài đặt shop");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được shop");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Nhập mật khẩu hiện tại và mật khẩu mới");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đã đổi mật khẩu");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không đổi được mật khẩu");
    }
  };

  const isLoading = isLoadingUser || isLoadingShop;

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ee4d2d] text-white">
                <Settings className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ee4d2d]">Cài đặt shop</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950">Hồ sơ seller và vận hành shop</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Cập nhật thông tin cá nhân, thông tin hiển thị của shop và bảo mật tài khoản bán hàng.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <MiniMetric label="Shop" value={shop?.name || "-"} />
              <MiniMetric label="Role" value={user?.role || "-"} />
              <MiniMetric label="Status" value={user?.isActive ? "Active" : "Locked"} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="h-80 animate-pulse rounded-3xl bg-white" />
            <div className="h-80 animate-pulse rounded-3xl bg-white" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
              <Card className="border-0 bg-white shadow-sm ring-1 ring-orange-100">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Thông tin shop</CardTitle>
                      <CardDescription>Đây là phần khách hàng nhìn thấy ở trang shop và product card.</CardDescription>
                    </div>
                    <FilePicker
                      label={isUploadingImage ? "Đang tải..." : "Tải ảnh shop"}
                      disabled={isUploadingImage}
                      onPick={(file) => handleUpload(file, "datn/shops", (url) => setShopForm((current) => ({ ...current, avatarUrl: url })))}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {shop ? (
                    <>
                      <div className="grid gap-5 md:grid-cols-[140px_minmax(0,1fr)]">
                        <AvatarImage imageUrl={shopForm.avatarUrl} fallback={shopForm.name || "Shop"} size="xl" />
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tên shop">
                              <Input value={shopForm.name} onChange={(event) => setShopForm((current) => ({ ...current, name: event.target.value }))} />
                            </Field>
                            <Field label="Slug">
                              <Input value={shopForm.slug} onChange={(event) => setShopForm((current) => ({ ...current, slug: event.target.value }))} />
                            </Field>
                          </div>
                          <Field label="Avatar URL">
                            <Input value={shopForm.avatarUrl} onChange={(event) => setShopForm((current) => ({ ...current, avatarUrl: event.target.value }))} />
                          </Field>
                          <Field label="Mô tả shop">
                            <Textarea className="min-h-32" value={shopForm.description} onChange={(event) => setShopForm((current) => ({ ...current, description: event.target.value }))} />
                          </Field>
                        </div>
                      </div>
                      <Button className="gap-2 bg-[#ee4d2d] hover:bg-[#d93f21]" disabled={isSavingShop || isUploadingImage} onClick={handleSaveShop}>
                        <Store className="size-4" />
                        Lưu shop
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                      Chưa có shop để cập nhật. Kiểm tra lại trạng thái duyệt seller.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-sm ring-1 ring-orange-100">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Hồ sơ người bán</CardTitle>
                      <CardDescription>Thông tin liên hệ của tài khoản seller.</CardDescription>
                    </div>
                    <FilePicker
                      label={isUploadingImage ? "Đang tải..." : "Tải avatar"}
                      disabled={isUploadingImage}
                      onPick={(file) => handleUpload(file, "datn/users", (url) => setProfileForm((current) => ({ ...current, avatarUrl: url })))}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <AvatarImage imageUrl={profileForm.avatarUrl} fallback={profileForm.fullName || user?.email || "Seller"} />
                  <Field label="Họ tên">
                    <Input value={profileForm.fullName} onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))} />
                  </Field>
                  <Field label="Email">
                    <Input value={user?.email || ""} disabled />
                  </Field>
                  <Field label="Số điện thoại">
                    <Input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
                  </Field>
                  <Field label="Avatar URL">
                    <Input value={profileForm.avatarUrl} onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))} />
                  </Field>
                  <Button variant="outline" className="gap-2" disabled={isSavingProfile || isUploadingImage} onClick={handleSaveProfile}>
                    <UserRound className="size-4" />
                    Lưu hồ sơ seller
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 bg-white shadow-sm ring-1 ring-orange-100">
              <CardHeader>
                <CardTitle>Bảo mật tài khoản seller</CardTitle>
                <CardDescription>Mật khẩu này dùng chung cho tài khoản mua hàng và kênh người bán.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Mật khẩu hiện tại">
                    <Input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
                  </Field>
                  <Field label="Mật khẩu mới">
                    <Input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
                  </Field>
                  <Field label="Xác nhận mật khẩu">
                    <Input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
                  </Field>
                </div>
                <Button variant="outline" className="gap-2" disabled={isChangingPassword} onClick={handleChangePassword}>
                  <KeyRound className="size-4" />
                  Đổi mật khẩu
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </SellerDashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FilePicker({ label, disabled, onPick }: { label: string; disabled?: boolean; onPick: (file?: File) => void }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <Camera className="size-4" />
      {label}
      <input type="file" accept="image/*" className="hidden" onChange={(event) => onPick(event.target.files?.[0])} />
    </label>
  );
}

function AvatarImage({ imageUrl, fallback, size = "md" }: { imageUrl?: string; fallback: string; size?: "md" | "xl" }) {
  const className = size === "xl" ? "size-32 text-3xl" : "size-20 text-xl";
  if (imageUrl) {
    return <img src={imageUrl} alt={fallback} className={`${className} rounded-3xl object-cover shadow-sm`} />;
  }
  return (
    <div className={`${className} flex items-center justify-center rounded-3xl bg-orange-100 font-semibold uppercase text-[#ee4d2d]`}>
      {fallback
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("") || "S"}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-24 rounded-2xl bg-orange-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-orange-500">{label}</p>
      <p className="mt-1 max-w-28 truncate font-semibold text-slate-900">{value}</p>
    </div>
  );
}

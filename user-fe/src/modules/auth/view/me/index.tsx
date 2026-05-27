import { type ReactNode, useEffect, useState } from "react";
import { Camera, KeyRound, LogOut, Save, ShieldCheck, Store, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLogout } from "@/modules/auth/api/logout";
import { useGetShopByOwnerId, useUpdateMyShop } from "@/modules/shop/api/myshop";
import { useUploadImage } from "@/modules/upload/api/upload-image";
import { useChangePassword, useGetCurrentUser, useUpdateProfile } from "@/modules/user/api/user";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function AccountPage() {
  const { data: user, isLoading } = useGetCurrentUser();
  const isSeller = user?.role === "SELLER";
  const { data: shop } = useGetShopByOwnerId({
    enabled: isSeller,
    retry: false,
    throwOnError: false as never,
  });

  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProfile();
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImage();
  const { mutateAsync: updateMyShop, isPending: isSavingShop } = useUpdateMyShop();

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
      toast.success("Đã lưu hồ sơ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được hồ sơ");
    }
  };

  const handleSaveShop = async () => {
    try {
      await updateMyShop(shopForm);
      toast.success("Đã lưu thông tin shop");
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

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-[#fff7f2] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="h-44 animate-pulse rounded-3xl bg-white" />
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="h-72 animate-pulse rounded-3xl bg-white" />
            <div className="h-72 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#fff7f2] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-3xl bg-[#ee4d2d] p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <AvatarImage imageUrl={profileForm.avatarUrl} fallback={profileForm.fullName || user?.email || "U"} size="lg" />
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-white/75">Tài khoản</p>
                <h1 className="mt-1 text-3xl font-semibold">{profileForm.fullName || user?.email || "Hồ sơ của bạn"}</h1>
                <p className="mt-2 text-sm text-white/80">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <HeroBadge label="Vai trò" value={user?.role || "CUSTOMER"} />
              <HeroBadge label="Trạng thái" value={user?.isActive ? "Đang hoạt động" : "Bị khóa"} />
              <HeroBadge label="Shop" value={isSeller ? "Seller" : "User"} />
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <Card className="border-0 bg-white shadow-sm ring-1 ring-orange-100">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center gap-4">
                  <AvatarImage imageUrl={profileForm.avatarUrl} fallback={profileForm.fullName || user?.email || "U"} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{profileForm.fullName || "Chưa đặt tên"}</p>
                    <p className="truncate text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl bg-orange-50 p-4">
                  <InfoRow icon={<UserRound className="size-4" />} label="Điện thoại" value={profileForm.phone || "Chưa cập nhật"} />
                  <InfoRow icon={<ShieldCheck className="size-4" />} label="Bảo mật" value="Đổi mật khẩu thủ công" />
                  <InfoRow icon={<Store className="size-4" />} label="Kênh bán" value={isSeller ? "Đã kích hoạt" : "Chưa đăng ký"} />
                </div>
                <Button variant="destructive" className="w-full gap-2" disabled={isLoggingOut} onClick={() => logout(undefined)}>
                  <LogOut className="size-4" />
                  Đăng xuất
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-5">
            <Card className="border-0 bg-white shadow-sm ring-1 ring-orange-100">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Thông tin người dùng</CardTitle>
                    <CardDescription>Cập nhật tên, số điện thoại và ảnh đại diện.</CardDescription>
                  </div>
                  <FilePicker
                    label={isUploadingImage ? "Đang tải..." : "Tải avatar"}
                    disabled={isUploadingImage}
                    onPick={(file) => handleUpload(file, "datn/users", (url) => setProfileForm((current) => ({ ...current, avatarUrl: url })))}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)]">
                  <AvatarImage imageUrl={profileForm.avatarUrl} fallback={profileForm.fullName || user?.email || "U"} size="xl" />
                  <div className="grid gap-4 md:grid-cols-2">
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
                  </div>
                </div>
                <Button className="gap-2 bg-[#ee4d2d] hover:bg-[#d93f21]" disabled={isSavingProfile || isUploadingImage} onClick={handleSaveProfile}>
                  <Save className="size-4" />
                  Lưu hồ sơ
                </Button>
              </CardContent>
            </Card>

            {isSeller ? (
              <Card className="border-0 bg-white shadow-sm ring-1 ring-orange-100">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Hồ sơ shop</CardTitle>
                      <CardDescription>Thông tin hiển thị ở trang shop và sản phẩm.</CardDescription>
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
                      <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)]">
                        <AvatarImage imageUrl={shopForm.avatarUrl} fallback={shopForm.name || "S"} size="xl" />
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tên shop">
                              <Input value={shopForm.name} onChange={(event) => setShopForm((current) => ({ ...current, name: event.target.value }))} />
                            </Field>
                            <Field label="Slug">
                              <Input value={shopForm.slug} onChange={(event) => setShopForm((current) => ({ ...current, slug: event.target.value }))} />
                            </Field>
                          </div>
                          <Field label="Avatar URL shop">
                            <Input value={shopForm.avatarUrl} onChange={(event) => setShopForm((current) => ({ ...current, avatarUrl: event.target.value }))} />
                          </Field>
                          <Field label="Mô tả shop">
                            <Textarea className="min-h-28" value={shopForm.description} onChange={(event) => setShopForm((current) => ({ ...current, description: event.target.value }))} />
                          </Field>
                        </div>
                      </div>
                      <Button className="gap-2 bg-[#ee4d2d] hover:bg-[#d93f21]" disabled={isSavingShop || isUploadingImage} onClick={handleSaveShop}>
                        <Store className="size-4" />
                        Lưu thông tin shop
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                      Tài khoản seller chưa có shop hoạt động.
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-0 bg-white shadow-sm ring-1 ring-orange-100">
              <CardHeader>
                <CardTitle>Bảo mật</CardTitle>
                <CardDescription>Đổi mật khẩu định kỳ để bảo vệ tài khoản.</CardDescription>
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
          </div>
        </div>
      </div>
    </div>
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

function FilePicker({
  label,
  disabled,
  onPick,
}: {
  label: string;
  disabled?: boolean;
  onPick: (file?: File) => void;
}) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <Camera className="size-4" />
      {label}
      <input type="file" accept="image/*" className="hidden" onChange={(event) => onPick(event.target.files?.[0])} />
    </label>
  );
}

function AvatarImage({ imageUrl, fallback, size = "md" }: { imageUrl?: string; fallback: string; size?: "md" | "lg" | "xl" }) {
  const sizes = {
    md: "size-16 text-lg",
    lg: "size-24 text-2xl",
    xl: "size-36 text-4xl",
  };

  if (imageUrl) {
    return <img src={imageUrl} alt={fallback} className={`${sizes[size]} rounded-3xl object-cover shadow-sm`} />;
  }

  return (
    <div className={`${sizes[size]} flex items-center justify-center rounded-3xl bg-orange-100 font-semibold uppercase text-[#ee4d2d]`}>
      {fallback
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("") || "U"}
    </div>
  );
}

function HeroBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-white/65">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="rounded-full bg-white p-2 text-[#ee4d2d] shadow-sm">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

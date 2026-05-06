import { type ReactNode, useEffect, useState } from "react";
import {
  Camera,
  LogOut,
  Save,
  Shield,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const { mutateAsync: logout, isPending: isLogoutPending } = useLogout();
  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProfile();
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImage();
  const { mutateAsync: updateMyShop, isPending: isSavingShop } = useUpdateMyShop();

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
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
    if (!user) {
      return;
    }

    setProfileForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  useEffect(() => {
    if (!shop) {
      return;
    }

    setShopForm({
      name: shop.name || "",
      slug: shop.slug || "",
      description: shop.description || "",
      avatarUrl: shop.avatarUrl || "",
    });
  }, [shop]);

  const uploadAvatar = async (file: File, folder: string) => {
    const result = await uploadImage({ file, folder });
    return result.url;
  };

  const handleProfileAvatarChange = async (file?: File) => {
    if (!file) {
      return;
    }

    try {
      const avatarUrl = await uploadAvatar(file, "datn/users");
      setProfileForm((current) => ({ ...current, avatarUrl }));
      toast.success("Da tai avatar len Cloudinary");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong tai duoc avatar";
      toast.error(message);
    }
  };

  const handleShopAvatarChange = async (file?: File) => {
    if (!file) {
      return;
    }

    try {
      const avatarUrl = await uploadAvatar(file, "datn/shops");
      setShopForm((current) => ({ ...current, avatarUrl }));
      toast.success("Da tai anh shop len Cloudinary");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong tai duoc anh shop";
      toast.error(message);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      toast.success("Cap nhat profile thanh cong");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong cap nhat duoc profile";
      toast.error(message);
    }
  };

  const handleSaveShop = async () => {
    try {
      await updateMyShop(shopForm);
      toast.success("Cap nhat shop thanh cong");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong cap nhat duoc shop";
      toast.error(message);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Nhap day du mat khau hien tai va mat khau moi");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mat khau xac nhan khong khop");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Doi mat khau thanh cong");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong doi duoc mat khau";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top,#ffe5d8,transparent_45%),linear-gradient(180deg,#fff7f3_0%,#ffffff_40%)] px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-56 animate-pulse rounded-[32px] bg-white/70 ring-1 ring-orange-100" />
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="h-96 animate-pulse rounded-[28px] bg-white/70 ring-1 ring-orange-100" />
            <div className="h-96 animate-pulse rounded-[28px] bg-white/70 ring-1 ring-orange-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top,#ffe1d1,transparent_38%),linear-gradient(180deg,#fff7f2_0%,#ffffff_45%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#1f2937_0%,#111827_36%,#ea580c_100%)] p-8 text-white shadow-[0_30px_80px_rgba(234,88,12,0.18)]">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_55%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-5">
              <ProfileImage
                imageUrl={profileForm.avatarUrl}
                fallback={profileForm.fullName || user?.email || "User"}
                size="lg"
              />
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">
                  <Sparkles className="size-3.5" />
                  profile center
                </div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {profileForm.fullName || "Tai khoan cua ban"}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/78">
                  Quan ly thong tin ca nhan, bao mat tai khoan va neu ban la seller thi co the cap nhat bo mat shop ngay tai day.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroMetric label="Vai tro" value={user?.role || "CUSTOMER"} />
              <HeroMetric label="Trang thai" value={user?.isActive ? "ACTIVE" : "LOCKED"} />
              <HeroMetric label="Seller" value={isSeller ? "SHOP MODE" : "USER MODE"} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className="rounded-[28px] border-0 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-orange-100/80">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center gap-4">
                  <ProfileImage
                    imageUrl={profileForm.avatarUrl}
                    fallback={profileForm.fullName || user?.email || "User"}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{profileForm.fullName || "Chua dat ten"}</p>
                    <p className="text-sm text-slate-500">{profileForm.email}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-[24px] bg-orange-50/70 p-4">
                  <InfoRow icon={<UserRound className="size-4" />} label="So dien thoai" value={profileForm.phone || "Chua cap nhat"} />
                  <InfoRow icon={<Shield className="size-4" />} label="Bao mat" value="Mat khau tu quan ly" />
                  <InfoRow icon={<Store className="size-4" />} label="Kenh ban" value={isSeller ? "Da kich hoat" : "Chua dang ky"} />
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isLogoutPending}
                  onClick={() => logout(undefined)}
                >
                  <LogOut className="size-4" />
                  Dang xuat
                </Button>
              </CardContent>
            </Card>

            {isSeller && (
              <Card className="rounded-[28px] border-0 bg-[#fff6ec] shadow-[0_20px_50px_rgba(234,88,12,0.08)] ring-1 ring-orange-100/90">
                <CardHeader>
                  <CardTitle>Seller controls</CardTitle>
                  <CardDescription>
                    Chinh avatar va thong tin shop de gian hang trong, ro va dong bo hon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <p>Avatar shop va mo ta shop duoc cap nhat ngay tu profile seller.</p>
                  <p>Slug shop cho phep tao URL gon gon hon de chia se gian hang.</p>
                </CardContent>
              </Card>
            )}
          </aside>

          <div className="space-y-6">
            <Card className="rounded-[30px] border-0 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70">
              <CardHeader>
                <div>
                  <CardTitle>Thong tin nguoi dung</CardTitle>
                  <CardDescription>Chinh sua ten, email, so dien thoai va avatar ca nhan.</CardDescription>
                </div>
                <CardAction>
                  <FilePicker
                    label={isUploadingImage ? "Dang tai..." : "Sua avatar"}
                    disabled={isUploadingImage}
                    onPick={handleProfileAvatarChange}
                  />
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <ProfileImage
                      imageUrl={profileForm.avatarUrl}
                      fallback={profileForm.fullName || user?.email || "User"}
                      size="xl"
                    />
                    <p className="text-center text-xs leading-5 text-slate-500">
                      Chon anh chan dung ro mat de profile gon gang hon.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Ho ten">
                      <Input
                        value={profileForm.fullName}
                        onChange={(event) =>
                          setProfileForm((current) => ({ ...current, fullName: event.target.value }))
                        }
                        placeholder="Nguyen Van A"
                      />
                    </Field>
                    <Field label="Email">
                      <Input
                        value={profileForm.email}
                        onChange={(event) =>
                          setProfileForm((current) => ({ ...current, email: event.target.value }))
                        }
                        placeholder="name@example.com"
                      />
                    </Field>
                    <Field label="So dien thoai">
                      <Input
                        value={profileForm.phone}
                        onChange={(event) =>
                          setProfileForm((current) => ({ ...current, phone: event.target.value }))
                        }
                        placeholder="09xxxxxxxx"
                      />
                    </Field>
                    <Field label="Avatar URL">
                      <Input
                        value={profileForm.avatarUrl}
                        onChange={(event) =>
                          setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))
                        }
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button disabled={isSavingProfile || isUploadingImage} onClick={handleSaveProfile}>
                  <Save className="size-4" />
                  Luu profile
                </Button>
              </div>
            </Card>

            {isSeller && shop && (
              <Card className="rounded-[30px] border-0 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf6_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.07)] ring-1 ring-orange-100/90">
                <CardHeader>
                  <div>
                    <CardTitle>Ho so shop</CardTitle>
                    <CardDescription>Seller co the cap nhat ten shop, slug, mo ta va anh dai dien gian hang.</CardDescription>
                  </div>
                  <CardAction>
                    <FilePicker
                      label={isUploadingImage ? "Dang tai..." : "Anh shop"}
                      disabled={isUploadingImage}
                      onPick={handleShopAvatarChange}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-4">
                      <ProfileImage
                        imageUrl={shopForm.avatarUrl}
                        fallback={shopForm.name || "Shop"}
                        size="xl"
                      />
                      <p className="text-center text-xs leading-5 text-slate-500">
                        Anh shop se hien o trang gian hang va khu thong tin nguoi ban.
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Ten shop">
                          <Input
                            value={shopForm.name}
                            onChange={(event) =>
                              setShopForm((current) => ({ ...current, name: event.target.value }))
                            }
                            placeholder="TechMall Official"
                          />
                        </Field>
                        <Field label="Slug">
                          <Input
                            value={shopForm.slug}
                            onChange={(event) =>
                              setShopForm((current) => ({ ...current, slug: event.target.value }))
                            }
                            placeholder="techmall-official"
                          />
                        </Field>
                      </div>
                      <Field label="Avatar URL shop">
                        <Input
                          value={shopForm.avatarUrl}
                          onChange={(event) =>
                            setShopForm((current) => ({ ...current, avatarUrl: event.target.value }))
                          }
                          placeholder="https://..."
                        />
                      </Field>
                      <Field label="Mo ta shop">
                        <Textarea
                          value={shopForm.description}
                          onChange={(event) =>
                            setShopForm((current) => ({ ...current, description: event.target.value }))
                          }
                          placeholder="Shop chuyen san pham cong nghe, linh kien, phu kien..."
                          className="min-h-32"
                        />
                      </Field>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 pb-6">
                  <Button disabled={isSavingShop || isUploadingImage} onClick={handleSaveShop}>
                    <Store className="size-4" />
                    Luu thong tin shop
                  </Button>
                </div>
              </Card>
            )}

            {isSeller && !shop && (
              <Card className="rounded-[30px] border-0 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf6_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.07)] ring-1 ring-orange-100/90">
                <CardHeader>
                  <CardTitle>Ho so shop</CardTitle>
                  <CardDescription>
                    Tai khoan dang la seller nhung hien chua tim thay shop de cap nhat.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card className="rounded-[30px] border-0 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70">
              <CardHeader>
                <CardTitle>Bao mat tai khoan</CardTitle>
                <CardDescription>Doi mat khau va giu session cua ban an toan hon.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Field label="Mat khau hien tai">
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                    }
                    placeholder="Nhap mat khau hien tai"
                  />
                </Field>
                <Field label="Mat khau moi">
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                    placeholder="Toi thieu 6 ky tu"
                  />
                </Field>
                <Field label="Xac nhan mat khau">
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    placeholder="Nhap lai mat khau moi"
                  />
                </Field>
              </CardContent>
              <div className="px-6 pb-6">
                <Button disabled={isChangingPassword} onClick={handleChangePassword}>
                  <Shield className="size-4" />
                  Doi mat khau
                </Button>
              </div>
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
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onPick(event.target.files?.[0])}
      />
    </label>
  );
}

function ProfileImage({
  imageUrl,
  fallback,
  size = "md",
}: {
  imageUrl?: string;
  fallback: string;
  size?: "md" | "lg" | "xl";
}) {
  const sizes = {
    md: "size-16 text-lg",
    lg: "size-24 text-3xl",
    xl: "size-36 text-4xl",
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={fallback}
        className={`${sizes[size]} rounded-[28px] object-cover shadow-[0_12px_35px_rgba(15,23,42,0.16)]`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} flex items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#fed7aa,#fdba74,#fb923c)] font-semibold uppercase text-white shadow-[0_12px_35px_rgba(234,88,12,0.18)]`}>
      {fallback
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("") || "U"}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-white/60">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-full bg-white p-2 text-orange-600 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

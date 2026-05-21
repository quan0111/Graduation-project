import { type ReactNode, useEffect, useState } from "react";
import {
  Camera,
  Crown,
  LogOut,
  Save,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useCreateAdminAccount, useAdminAccounts } from "@/modules/admin/api/admin-users";
import { useLogout } from "@/modules/auth/api/logout";
import { useUploadImage } from "@/modules/upload/api/upload-image";
import { useChangePassword, useGetCurrentUser, useUpdateProfile } from "@/modules/user/api/user";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type CreateAdminForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl: string;
};

export default function AdminProfilePage() {
  const { data: user, isLoading } = useGetCurrentUser();
  const { data: adminAccounts = [] } = useAdminAccounts();

  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useUpdateProfile();
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImage();
  const { mutateAsync: createAdminAccount, isPending: isCreatingAdmin } = useCreateAdminAccount();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [createAdminForm, setCreateAdminForm] = useState<CreateAdminForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    avatarUrl: "",
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

  const handleProfileAvatar = async (file?: File) => {
    if (!file) {
      return;
    }

    try {
      const result = await uploadImage({ file, folder: "datn/admins" });
      setProfileForm((current) => ({ ...current, avatarUrl: result.url }));
      toast.success("Đã tải avatar admin lên Cloudinary");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tải được avatar";
      toast.error(message);
    }
  };

  const handleNewAdminAvatar = async (file?: File) => {
    if (!file) {
      return;
    }

    try {
      const result = await uploadImage({ file, folder: "datn/admins" });
      setCreateAdminForm((current) => ({ ...current, avatarUrl: result.url }));
      toast.success("Đã tải avatar admin mới");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tải được avatar";
      toast.error(message);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      toast.success("Cập nhật profile admin thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không cập nhật được profile";
      toast.error(message);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Nhập đầy đủ mật khẩu hiện tại và mật khẩu mới");
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
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Đổi mật khẩu admin thành công");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không đổi được mật khẩu";
      toast.error(message);
    }
  };

  const handleCreateAdmin = async () => {
    if (!createAdminForm.email || !createAdminForm.password) {
      toast.error("Email và mật khẩu là bắt buộc");
      return;
    }

    try {
      await createAdminAccount(createAdminForm);
      setCreateAdminForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        avatarUrl: "",
      });
      toast.success("Đã tạo tài khoản admin mới");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tạo được admin mới";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#111827_0%,#1d4ed8_45%,#06b6d4_100%)] p-8 text-white shadow-[0_26px_80px_rgba(29,78,216,0.25)]">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_58%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-center gap-5">
            <AdminAvatar imageUrl={profileForm.avatarUrl} label={profileForm.fullName || profileForm.email || "Admin"} large />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">
                <Sparkles className="size-3.5" />
                trung tâm quản trị
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {profileForm.fullName || "Hồ sơ admin"}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/80">
                Quản lý thông tin admin, bảo mật đăng nhập và tạo thêm tài khoản admin mới ngay trong bảng điều khiển.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMetric label="Vai trò" value={user?.role || "ADMIN"} />
            <HeroMetric label="Trạng thái" value={user?.isActive ? "ACTIVE" : "LOCKED"} />
            <HeroMetric label="Admin" value={`${adminAccounts.length} tài khoản`} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-0 bg-card shadow-sm ring-1 ring-border/70">
            <CardHeader>
              <div>
                <CardTitle>Thông tin admin</CardTitle>
                <CardDescription>Cập nhật tên, email, số điện thoại và avatar của tài khoản quản trị.</CardDescription>
              </div>
              <CardAction>
                <FilePicker
                  label={isUploadingImage ? "Đang tải..." : "Sửa avatar"}
                  disabled={isUploadingImage}
                  onPick={handleProfileAvatar}
                />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <AdminAvatar imageUrl={profileForm.avatarUrl} label={profileForm.fullName || profileForm.email || "Admin"} />
                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    Nên dùng avatar rõ ràng để dễ phân biệt khi xử lý báo cáo và duyệt seller.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Họ tên">
                    <Input
                      value={profileForm.fullName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                      placeholder="Tên admin"
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      value={profileForm.email}
                      onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="admin@example.com"
                    />
                  </Field>
                  <Field label="Số điện thoại">
                    <Input
                      value={profileForm.phone}
                      onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="09xxxxxxxx"
                    />
                  </Field>
                  <Field label="Avatar URL">
                    <Input
                      value={profileForm.avatarUrl}
                      onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                      placeholder="https://..."
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
            <div className="px-4 pb-4">
              <Button disabled={isSavingProfile || isUploadingImage} onClick={handleSaveProfile}>
                <Save className="size-4" />
                Lưu hồ sơ
              </Button>
            </div>
          </Card>

          <Card className="rounded-[28px] border-0 bg-card shadow-sm ring-1 ring-border/70">
            <CardHeader>
              <CardTitle>Mật khẩu và bảo mật</CardTitle>
              <CardDescription>Đổi mật khẩu cho admin hiện tại.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="Mật khẩu hiện tại">
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  placeholder="Mật khẩu hiện tại"
                />
              </Field>
              <Field label="Mật khẩu mới">
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </Field>
              <Field label="Xác nhận mật khẩu">
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </Field>
            </CardContent>
            <div className="px-4 pb-4">
              <Button disabled={isChangingPassword} onClick={handleChangePassword}>
                <Shield className="size-4" />
                Đổi mật khẩu
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-0 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] shadow-sm ring-1 ring-sky-100">
            <CardHeader>
              <div>
                <CardTitle>Tạo admin mới</CardTitle>
                <CardDescription>Admin hiện tại có thể tạo thêm tài khoản admin từ backend.</CardDescription>
              </div>
              <CardAction>
                <FilePicker
                  label={isUploadingImage ? "Đang tải..." : "Avatar"}
                  disabled={isUploadingImage}
                  onPick={handleNewAdminAvatar}
                />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-3xl bg-sky-50 p-4">
                <AdminAvatar imageUrl={createAdminForm.avatarUrl} label={createAdminForm.fullName || createAdminForm.email || "New"} />
                <div>
                  <p className="font-medium text-slate-900">{createAdminForm.fullName || "Admin mới"}</p>
                  <p className="text-sm text-slate-500">{createAdminForm.email || "Chưa có email"}</p>
                </div>
              </div>

              <Field label="Họ tên">
                <Input
                  value={createAdminForm.fullName}
                  onChange={(event) => setCreateAdminForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Trần Văn B"
                />
              </Field>
              <Field label="Email">
                <Input
                  value={createAdminForm.email}
                  onChange={(event) => setCreateAdminForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="new-admin@example.com"
                />
              </Field>
              <Field label="Số điện thoại">
                <Input
                  value={createAdminForm.phone}
                  onChange={(event) => setCreateAdminForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="09xxxxxxxx"
                />
              </Field>
              <Field label="Mật khẩu">
                <Input
                  type="password"
                  value={createAdminForm.password}
                  onChange={(event) => setCreateAdminForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Nhập mật khẩu mạnh"
                />
              </Field>
              <Field label="Avatar URL">
                <Input
                  value={createAdminForm.avatarUrl}
                  onChange={(event) => setCreateAdminForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </Field>
            </CardContent>
            <div className="px-4 pb-4">
              <Button disabled={isCreatingAdmin || isUploadingImage} onClick={handleCreateAdmin}>
                <UserPlus className="size-4" />
                Tạo tài khoản admin
              </Button>
            </div>
          </Card>

          <Card className="rounded-[28px] border-0 bg-card shadow-sm ring-1 ring-border/70">
            <CardHeader>
              <CardTitle>Danh sách admin</CardTitle>
              <CardDescription>Theo dõi những tài khoản admin đang hoạt động trong hệ thống.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {adminAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <AdminAvatar imageUrl={account.avatarUrl} label={account.fullName || account.email} small />
                    <div>
                      <p className="font-medium text-foreground">{account.fullName || account.email}</p>
                      <p className="text-xs text-muted-foreground">{account.email}</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {account.role}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-0 bg-slate-950 text-white shadow-sm">
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <Crown className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">Phiên quản trị hiện tại</p>
                  <p className="text-sm text-white/60">Đăng nhập bằng token admin + refresh cookie riêng.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/6 p-4 text-sm text-white/75">
                <Users className="size-4" />
                {adminAccounts.length} admin đang tồn tại trong hệ thống
              </div>
              <Button
                variant="outline"
                className="w-full border-white/15 bg-white/10 text-white hover:bg-white/15"
                disabled={isLoggingOut}
                onClick={() => logout(undefined)}
              >
                <LogOut className="size-4" />
                Đăng xuất admin
              </Button>
            </CardContent>
          </Card>
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
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
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

function AdminAvatar({
  imageUrl,
  label,
  large,
  small,
}: {
  imageUrl?: string;
  label: string;
  large?: boolean;
  small?: boolean;
}) {
  const className = large ? "size-24" : small ? "size-10" : "size-28";

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} />
      <AvatarFallback>
        {label
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase() || "AD"}
      </AvatarFallback>
    </Avatar>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.16em] text-white/60">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Crown,
  Database,
  Lock,
  Save,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAccounts } from "@/modules/admin/api/admin-users";
import { useDashboard } from "@/modules/home/api/dashboard";
import { useResolveSecurityIncident, useSecurityIncidents } from "@/modules/violations/api/moderation";

type SettingsTab = "system" | "user" | "seller" | "admin" | "security";

type LocalSettings = {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  announcement: string;
  userRegistration: boolean;
  emailVerification: boolean;
  guestCheckout: boolean;
  sellerRegistration: boolean;
  productApprovalRequired: boolean;
  sellerSlaHours: string;
  defaultCommission: string;
  emailNotification: boolean;
  pushNotification: boolean;
  auditRetentionDays: string;
  backupNote: string;
};

const STORAGE_KEY = "markethub.admin.settings";

const defaultSettings: LocalSettings = {
  platformName: "MarketHub",
  supportEmail: "support@markethub.vn",
  supportPhone: "1900 0000",
  address: "TP. Hồ Chí Minh",
  announcement: "Miễn phí vận chuyển cho đơn hàng trên 500k đ",
  userRegistration: true,
  emailVerification: false,
  guestCheckout: false,
  sellerRegistration: true,
  productApprovalRequired: true,
  sellerSlaHours: "48",
  defaultCommission: "10",
  emailNotification: true,
  pushNotification: true,
  auditRetentionDays: "180",
  backupNote: "Backup database theo lịch vận hành nội bộ.",
};

const tabs: Array<{ key: SettingsTab; label: string; icon: any }> = [
  { key: "system", label: "Hệ thống", icon: Settings },
  { key: "user", label: "User", icon: UserRound },
  { key: "seller", label: "Seller", icon: Store },
  { key: "admin", label: "Admin", icon: Crown },
  { key: "security", label: "Bảo mật", icon: Lock },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("system");
  const [settings, setSettings] = useState<LocalSettings>(defaultSettings);
  const { data: dashboard } = useDashboard({});
  const { data: adminAccounts = [] } = useAdminAccounts();
  const { data: incidents = [], isLoading: isLoadingIncidents } = useSecurityIncidents();
  const resolveIncident = useResolveSecurityIncident();

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setSettings({ ...defaultSettings, ...JSON.parse(raw) });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const openIncidents = useMemo(() => incidents.filter((incident) => incident.status === "OPEN"), [incidents]);

  const updateSetting = <K extends keyof LocalSettings>(key: K, value: LocalSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Đã lưu cài đặt trên trình duyệt admin");
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Settings className="size-3.5" />
            System settings
          </div>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Cài đặt nền tảng</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Quản lý cài đặt vận hành cho user, seller và admin. Các mục cấu hình hệ thống đang lưu local để phục vụ demo, còn dữ liệu admin và security lấy từ API thật.
          </p>
        </div>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="size-4" />
          Lưu cài đặt
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric icon={<Users className="size-5" />} label="Người dùng" value={dashboard?.totalUsers ?? 0} />
        <Metric icon={<Store className="size-5" />} label="Shop" value={dashboard?.totalShops ?? 0} />
        <Metric icon={<Crown className="size-5" />} label="Admin" value={adminAccounts.length} />
        <Metric icon={<AlertTriangle className="size-5" />} label="Incident mở" value={openIncidents.length} danger={openIncidents.length > 0} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="h-fit border-border bg-card">
          <CardContent className="space-y-2 p-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  activeTab === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {activeTab === "system" && (
            <SettingsSection
              title="Cài đặt hệ thống"
              description="Thông tin chung dùng cho header, email hỗ trợ và thông báo vận hành."
              icon={<Settings className="size-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên nền tảng">
                  <Input value={settings.platformName} onChange={(event) => updateSetting("platformName", event.target.value)} />
                </Field>
                <Field label="Email hỗ trợ">
                  <Input value={settings.supportEmail} onChange={(event) => updateSetting("supportEmail", event.target.value)} />
                </Field>
                <Field label="Số điện thoại hỗ trợ">
                  <Input value={settings.supportPhone} onChange={(event) => updateSetting("supportPhone", event.target.value)} />
                </Field>
                <Field label="Địa chỉ vận hành">
                  <Input value={settings.address} onChange={(event) => updateSetting("address", event.target.value)} />
                </Field>
              </div>
              <Field label="Thông báo đầu trang">
                <Textarea value={settings.announcement} onChange={(event) => updateSetting("announcement", event.target.value)} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleRow label="Thông báo email" description="Gửi email cho sự kiện quan trọng." checked={settings.emailNotification} onChange={(value) => updateSetting("emailNotification", value)} />
                <ToggleRow label="Thông báo trong app" description="Hiển thị notification ở dashboard." checked={settings.pushNotification} onChange={(value) => updateSetting("pushNotification", value)} />
              </div>
            </SettingsSection>
          )}

          {activeTab === "user" && (
            <SettingsSection
              title="Cài đặt user"
              description="Luồng tài khoản khách hàng, checkout và quyền tự phục vụ."
              icon={<UserRound className="size-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleRow label="Cho phép đăng ký user" description="Tắt mục này khi cần khóa đăng ký mới." checked={settings.userRegistration} onChange={(value) => updateSetting("userRegistration", value)} />
                <ToggleRow label="Bắt xác thực email" description="Bật khi muốn user xác minh email trước khi mua hàng." checked={settings.emailVerification} onChange={(value) => updateSetting("emailVerification", value)} />
                <ToggleRow label="Guest checkout" description="Giữ tắt để bắt buộc đăng nhập trước checkout." checked={settings.guestCheckout} onChange={(value) => updateSetting("guestCheckout", value)} />
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Trang user hiện dùng `/profile` để cập nhật hồ sơ, mật khẩu và nếu tài khoản là seller thì có thêm phần shop.
              </div>
              <Link to="/users">
                <Button variant="outline">Quản lý user</Button>
              </Link>
            </SettingsSection>
          )}

          {activeTab === "seller" && (
            <SettingsSection
              title="Cài đặt seller"
              description="Quy định mở shop, duyệt sản phẩm và SLA vận hành."
              icon={<Store className="size-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleRow label="Cho phép đăng ký seller" description="User có thể gửi hồ sơ đăng ký kênh bán." checked={settings.sellerRegistration} onChange={(value) => updateSetting("sellerRegistration", value)} />
                <ToggleRow label="Bắt duyệt sản phẩm" description="Sản phẩm seller sửa hoặc tạo mới cần admin duyệt." checked={settings.productApprovalRequired} onChange={(value) => updateSetting("productApprovalRequired", value)} />
                <Field label="SLA xử lý đơn (giờ)">
                  <Input value={settings.sellerSlaHours} onChange={(event) => updateSetting("sellerSlaHours", event.target.value)} />
                </Field>
                <Field label="Commission mặc định (%)">
                  <Input value={settings.defaultCommission} onChange={(event) => updateSetting("defaultCommission", event.target.value)} />
                </Field>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/seller-applications">
                  <Button variant="outline">Duyệt seller</Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline">Duyệt sản phẩm</Button>
                </Link>
              </div>
            </SettingsSection>
          )}

          {activeTab === "admin" && (
            <SettingsSection
              title="Cài đặt admin"
              description="Theo dõi tài khoản admin và đi tới màn tạo admin mới."
              icon={<Crown className="size-5" />}
            >
              <div className="grid gap-3">
                {adminAccounts.slice(0, 8).map((account) => (
                  <div key={account.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{account.fullName || account.email}</p>
                      <p className="truncate text-sm text-muted-foreground">{account.email}</p>
                    </div>
                    <Badge className="gap-1">
                      <Crown className="size-3" />
                      {account.role}
                    </Badge>
                  </div>
                ))}
              </div>
              <Link to="/profile">
                <Button variant="outline">Mở hồ sơ admin và tạo admin mới</Button>
              </Link>
            </SettingsSection>
          )}

          {activeTab === "security" && (
            <SettingsSection
              title="Bảo mật và dữ liệu"
              description="Incident bảo mật lấy từ API moderation. Backup hiện là ghi chú vận hành."
              icon={<ShieldCheck className="size-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Lưu audit log (ngày)">
                  <Input value={settings.auditRetentionDays} onChange={(event) => updateSetting("auditRetentionDays", event.target.value)} />
                </Field>
                <Field label="Ghi chú backup">
                  <Input value={settings.backupNote} onChange={(event) => updateSetting("backupNote", event.target.value)} />
                </Field>
              </div>
              <div className="space-y-3">
                {isLoadingIncidents ? (
                  <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Đang tải incident...</div>
                ) : openIncidents.length ? (
                  openIncidents.slice(0, 5).map((incident) => (
                    <div key={incident.id} className="flex items-start justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
                      <div>
                        <p className="font-medium text-foreground">Incident #{incident.id}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{incident.reason}</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline">{incident.severity}</Badge>
                          <Badge variant="secondary">User #{incident.userId}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" disabled={resolveIncident.isPending} onClick={() => resolveIncident.mutate({ id: incident.id })}>
                        Đã xử lý
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Không có incident bảo mật đang mở.
                  </div>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ActionPanel icon={<Database className="size-5" />} title="Database" description="Theo dõi backup và migration bằng công cụ backend." />
                <ActionPanel icon={<Bell className="size-5" />} title="Notification" description="Các event quan trọng đã có notification riêng." />
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </main>
  );
}

function SettingsSection({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
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

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Metric({ icon, label, value, danger = false }: { icon: ReactNode; label: string; value: number; danger?: boolean }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex size-11 items-center justify-center rounded-2xl ${danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionPanel({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-2 font-medium text-foreground">
        {icon}
        {title}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

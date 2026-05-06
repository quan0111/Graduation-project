import { GeneralSettings } from "../components/general-setting";
import { SecuritySettings } from "../components/security-setting";
import { NotificationSettings } from "../components/notification-setting";
import { AdminManagement } from "../components/admin-management";
import { DatabaseSettings } from "../components/database-setting";

export default function SettingsPage() {
  return (
    <main className="flex-1 overflow-auto p-6 w-full ">
      <div className="space-y-6">
        <GeneralSettings />
        <SecuritySettings />
        <NotificationSettings />
        <AdminManagement />
        <DatabaseSettings />
      </div>
    </main>
  );
}
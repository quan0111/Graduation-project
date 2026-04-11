// sections/Sidebar.tsx

import React from "react";
import { User, MapPin, Lock, LogOut } from "lucide-react";

type TabType = "profile" | "address" | "password";

type Profile = {
  avatar: string;
  fullName: string;
};

type SidebarProps = {
  tab: TabType;
  setTab: (tab: TabType) => void;
  profile: Profile;
  onLogout?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({
  tab,
  setTab,
  profile,
  onLogout,
}) => {
  const menu: {
    id: TabType;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "profile", label: "Thông tin", icon: User },
    { id: "address", label: "Địa chỉ", icon: MapPin },
    { id: "password", label: "Mật khẩu", icon: Lock },
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* Avatar */}
      <div className="text-center">
        <img
          src={profile.avatar}
          alt="avatar"
          className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
        />
        <p className="font-semibold">{profile.fullName}</p>
      </div>

      {/* Menu */}
      {menu.map((m) => {
        const Icon = m.icon;

        return (
          <button
            key={m.id}
            onClick={() => setTab(m.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
              ${
                tab === m.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }
            `}
          >
            <Icon size={18} />
            {m.label}
          </button>
        );
      })}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="text-red-500 flex items-center gap-2 px-4 py-2"
      >
        <LogOut size={18} />
        Đăng xuất
      </button>
    </div>
  );
};
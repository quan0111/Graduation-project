import { useGetCurrentUser } from "@/modules/user/api/user";
import { useGetAddresses } from "@/modules/address/api/get-address";
import { Sidebar } from "../../components/sidebar";
import { Content } from "../../components/contentSwitcher";
import { useState, useMemo } from "react";

export default function AccountPage() {
  type TabType = "profile" | "address" | "password";
  
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const { data: addresses, isLoading: addressesLoading } = useGetAddresses();
  const [tab, setTab] = useState<TabType>("profile");

  // Transform user data to match Profile type expected by Sidebar
  const profile = useMemo(() => ({
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=random`,
    fullName: user?.fullName || "Người dùng",
  }), [user]);

  // Show loading state
  if (userLoading || addressesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const state = {
    tab,
    setTab: setTab as (tab: TabType) => void,
    profile,
    addresses: addresses || [],
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 p-6">
      <Sidebar
        tab={tab}
        setTab={setTab as (tab: TabType) => void}
        profile={profile}
      />

      <div className="md:col-span-3">
        <Content tab={tab} state={state} />
      </div>
    </div>
  );
}
// page.tsx
import { useAccount } from "../../hook/useAccount";
import { Sidebar } from "../../components/sidebar";
import { Content } from "../../components/contentSwitcher";
export default function Page() {
  type TabType = "profile" | "address" | "password";
  const state = useAccount();

  return (
    <div className="grid md:grid-cols-4 gap-6 p-6">

      <Sidebar
        tab={state.tab as TabType}
        setTab={state.setTab}
        profile={state.profile}
      />

      <div className="md:col-span-3">
        <Content tab={state.tab as TabType} state={state} />
      </div>

    </div>
  );
}
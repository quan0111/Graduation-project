import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "./dashboard/header"
import "../index.css"

export default function RootLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">

        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1">

          {/* Header */}
          <DashboardHeader />

          {/* Page content */}
          <main className="flex-1 p-4">
            <Outlet />
          </main>

        </div>
      </div>
    </SidebarProvider>
  )
}
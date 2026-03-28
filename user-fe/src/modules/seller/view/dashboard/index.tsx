'use client'

import { useState } from 'react'
import { DashboardOverview } from '../../component/dash-board-overview'
import { ProductsManagement } from '../../component/product-management'
import { OrdersManagement } from '../../component/order-management'
import { ShippingConfig } from '../../component/shipping-config'
import { ReturnsRefunds } from '../../component/return-refunds'
import { BatchShipping } from '../../component/batch-shipping'
import { Menu, X, LayoutDashboard, Package, ShoppingCart, Truck, RotateCcw, Copy } from 'lucide-react'

type Page = 'dashboard' | 'products' | 'orders' | 'shipping' | 'returns' | 'batch-shipping'

export function SellerDashboardView() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sidebarMenu = [
    { label: 'Dashboard', value: 'dashboard' as const, icon: LayoutDashboard },
    { label: 'Sản Phẩm', value: 'products' as const, icon: Package },
    { label: 'Đơn Hàng', value: 'orders' as const, icon: ShoppingCart },
    { label: 'Cài Đặt Vận Chuyển', value: 'shipping' as const, icon: Truck },
    { label: 'Trả hàng/Hoàn Tiền', value: 'returns' as const, icon: RotateCcw },
    { label: 'Giao Hàng Loạt', value: 'batch-shipping' as const, icon: Copy },
  ]

  const currentLabel = sidebarMenu.find(m => m.value === currentPage)?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-background">

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } border-r border-border bg-card transition-all duration-300 overflow-y-auto flex flex-col`}
        >
          {/* Sidebar Toggle */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            {sidebarOpen && <h2 className="text-lg font-bold text-foreground">Quản Lý</h2>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-secondary rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-2">
            {sidebarMenu.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.value}
                  onClick={() => setCurrentPage(item.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                    currentPage === item.value
                      ? 'bg-primary text-white shadow-md'
                      : 'text-foreground hover:bg-secondary/50'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Page Header */}
          <div className="border-b border-border bg-card px-6 py-4 sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-foreground">{currentLabel}</h1>
            <p className="text-sm text-muted-foreground mt-1">Quản lý các hoạt động kinh doanh của bạn</p>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto w-full">
              {currentPage === 'dashboard' && (
                <DashboardOverview
                  stats={{
                    waitingPickup: 0,
                    processed: 0,
                    returns: 0,
                    blockedProducts: 0,
                  }}
                />
              )}
              {currentPage === 'products' && <ProductsManagement />}
              {currentPage === 'orders' && <OrdersManagement />}
              {currentPage === 'shipping' && <ShippingConfig />}
              {currentPage === 'returns' && <ReturnsRefunds />}
              {currentPage === 'batch-shipping' && <BatchShipping />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

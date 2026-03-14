import type { ReactNode } from 'react'
import { ShoppingBag, Truck, Shield, Award } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full items-center">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-primary to-orange-500 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">ShopHub</h1>
            </div>
            <p className="text-xl text-muted-foreground font-medium">
              Mua sắm thông minh, giá tốt nhất
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Giao hàng nhanh 24h</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Thanh toán an toàn</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Giá cả cạnh tranh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex justify-center md:justify-start">
          {children}
        </div>
      </div>
    </div>
  )
}

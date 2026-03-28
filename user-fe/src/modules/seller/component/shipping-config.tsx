import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ChevronDown } from 'lucide-react'

interface ShippingServiceProps {
  name: string
  description: string
  enabled: boolean
  required?: boolean
}

function ShippingServiceToggle({ name, description, enabled, required }: ShippingServiceProps) {
  return (
    <div className="border-b border-border py-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-1">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {required && <span className="text-xs text-primary">[COD đã được kích hoạt]</span>}
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={enabled} />
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

export function ShippingConfig() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Cài Đặt Vận Chuyển</h2>

      <Tabs defaultValue="shipping-methods" className="w-full">
        <TabsList className="w-full border-b border-border grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-0 bg-transparent h-auto flex-wrap">
          <TabsTrigger value="account" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent text-sm">Tài Khoản</TabsTrigger>
          <TabsTrigger value="shipping-methods" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent text-sm">Vận Chuyển</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent text-sm hidden sm:block">Thanh Toán</TabsTrigger>
          <TabsTrigger value="products" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent text-sm hidden sm:block">Sản Phẩm</TabsTrigger>
          <TabsTrigger value="chat" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent text-sm hidden md:block">Chat</TabsTrigger>
          <TabsTrigger value="notification" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent text-sm hidden md:block">Thông Báo</TabsTrigger>
          <TabsTrigger value="other" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent text-sm hidden lg:block">Tạm Nghỉ</TabsTrigger>
        </TabsList>

        <TabsContent value="shipping-methods" className="space-y-6">
          {/* Hóa Tốc Section */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Hóa Tốc</h3>
            <p className="text-sm text-muted-foreground mb-4">Phương thức vận chuyển giao đến Người mua trong thời gian sớm nhất</p>
            
            <div className="space-y-4">
              <ShippingServiceToggle
                name="Hóa Tốc"
                description="[COD đã được kích hoạt]"
                enabled={true}
                required={true}
              />
            </div>
          </div>

          {/* Trong Ngày Section */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Trong Ngày</h3>
            <p className="text-sm text-muted-foreground mb-4">Bắt tùy chọn để cung cấp dịch vụ giao hàng trong cùng ngày cho Người mua</p>
            
            <div className="space-y-4">
              <ShippingServiceToggle
                name="Trong Ngày"
                description=""
                enabled={false}
              />
            </div>
          </div>

          {/* Nhanh Section */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Nhanh</h3>
            <p className="text-sm text-muted-foreground mb-4">Phương thức vận chuyển chuyên nghiệp, nhanh chóng và đáng tin cậy</p>
            
            <div className="space-y-4">
              <ShippingServiceToggle
                name="Nhanh"
                description="[COD đã được kích hoạt]"
                enabled={true}
              />
            </div>
          </div>

          {/* Từ Nhận Hàng Section */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Từ Nhận Hàng</h3>
            <p className="text-sm text-muted-foreground mb-4">Cho phép Người mua mua từ nhân đơn hàng tại địa điểm và thời gian thuận tiện</p>
            
            <div className="space-y-4">
              <ShippingServiceToggle
                name="Từ Nhận Hàng"
                description="[COD đã được kích hoạt]"
                enabled={true}
              />
            </div>
          </div>

          {/* Diễm nhân hàng Section */}
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Diễm nhân hàng</h3>
            
            <div className="space-y-4">
              <ShippingServiceToggle
                name="Diễm nhân hàng"
                description="[COD đã được kích hoạt]"
                enabled={true}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Cài đặt tài khoản</p>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Cài đặt thanh toán</p>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Cài đặt sản phẩm</p>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Cài đặt chat</p>
          </div>
        </TabsContent>

        <TabsContent value="notification" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Cài đặt thông báo</p>
          </div>
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Chế độ tạm nghỉ</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

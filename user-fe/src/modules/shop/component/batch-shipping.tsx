import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, AlertCircle } from 'lucide-react'

export function BatchShipping() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Giao Hàng Loạt</h2>

      <Tabs defaultValue="batch">
        <TabsList className="w-full border-b border-border grid grid-cols-2 gap-0 bg-transparent">
          <TabsTrigger value="batch" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Chờ giao hàng</TabsTrigger>
          <TabsTrigger value="tao-phieu" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Tạo Phiếu</TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="space-y-4">
          {/* Shipping Status Card */}
          <Card className="p-6 border border-border">
            <h3 className="font-bold text-foreground mb-4">Chuẩn bị đơn hàng loạt</h3>
            <p className="text-sm text-muted-foreground mb-4">0 kiện hàng được chọn</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Lấy hàng</label>
                <p className="text-muted-foreground mt-2">Địa chỉ lấy hàng</p>
                <p className="text-sm mb-2">Đào Anh Quân | 84988439303</p>
                <p className="text-sm text-muted-foreground">Số Nhà 85, Đường Phạm Ngũ Lão, Từ Mỹ, Phương Phùng Chi Kiến, Thị Xã Mỹ Hào, Hưng Yên, Việt Nam</p>
                <Button variant="outline" className="mt-2" size="sm">
                  Đổi
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Ngày lấy hàng</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Tùy chọn 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-primary text-white">
                <Package className="w-4 h-4 mr-2" />
                Yêu cầu đơn vị vận chuyển đến lấy hàng
              </Button>
            </div>
          </Card>

          {/* Alert */}
          <Card className="p-4 border border-border bg-amber-50">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Bưu cục gần bạn nhất:</p>
                <p className="text-sm text-amber-800 mt-1">
                  Điểm dịch vụ SPX Hưng Yên - Mỹ Hào 2 (1.21km)
                </p>
                <p className="text-sm text-amber-800">Kiểm tra vị trí các bưu cục trên bản đồ</p>
              </div>
            </div>
          </Card>

          {/* Empty State */}
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-muted-foreground mb-4">Không có dữ liệu</p>
            <p className="text-sm text-muted-foreground mb-6">Chọn các đơn hàng để bắt đầu giao hàng loạt</p>
          </div>
        </TabsContent>

        <TabsContent value="tao-phieu" className="space-y-4">
          <Card className="p-6 border border-border">
            <h3 className="font-bold text-foreground mb-4">Tạo Phiếu</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Chọn Đơn Vị Vận Chuyển</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đơn vị vận chuyển" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spx">SPX Express</SelectItem>
                    <SelectItem value="ghn">Giao Hàng Nhanh</SelectItem>
                    <SelectItem value="vnp">VNPost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Tìm Đơn Hàng</label>
                <Input placeholder="Nhập mã đơn hàng, SKU..." />
              </div>

              <Button className="w-full bg-primary text-white">
                Tạo Phiếu Gửi
              </Button>
            </div>
          </Card>

          {/* Empty State */}
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Chưa có phiếu gửi nào</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

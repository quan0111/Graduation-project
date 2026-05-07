import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function OrdersManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Tất Cả (Orders)</h2>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full border-b border-border grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 bg-transparent h-auto flex-wrap">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Tất cả</TabsTrigger>
          <TabsTrigger value="waiting" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Chờ lấy hàng</TabsTrigger>
          <TabsTrigger value="promotion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden sm:block">Chờ lấy (Đơn)</TabsTrigger>
          <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden sm:block">Đang giao</TabsTrigger>
          <TabsTrigger value="delivered" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden lg:block">Đã giao</TabsTrigger>
          <TabsTrigger value="returned" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden lg:block">Trả hàng/Hoàn tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Loại Đơn hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="normal">Đơn thường</SelectItem>
                <SelectItem value="flash">Đơn Flash Sale</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái Đơn hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empty State */}
          <div className="border border-dashed border-border rounded-lg p-12 text-center bg-gray-50">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-300">📋</div>
              <p className="text-muted-foreground mb-4">0 Kiến hàng</p>
              <Button className="bg-primary text-white">Giao Hàng Loạt</Button>
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm">
            <div>Sản phẩm</div>
            <div>Số tiền</div>
            <div>Lý do</div>
            <div>Phương thức giao</div>
            <div>Trạng thái</div>
            <div>Đơn vị vận chuyển</div>
            <div>Thao tác</div>
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có đơn hàng chờ lấy</p>
          </div>
        </TabsContent>

        <TabsContent value="promotion" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có đơn hàng chương trình</p>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có đơn hàng đang giao</p>
          </div>
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có đơn hàng đã giao</p>
          </div>
        </TabsContent>

        <TabsContent value="returned" className="mt-6">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có đơn hàng trả/hoàn</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

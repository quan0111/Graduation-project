import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ReturnRequest {
  id: string
  orderId: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export function ReturnsRefunds() {
  const returns: ReturnRequest[] = []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Trả hàng/Hoàn Tiền</h2>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full border-b border-border grid grid-cols-2 sm:grid-cols-4 gap-0 bg-transparent">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Tất cả</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Đang xem xét</TabsTrigger>
          <TabsTrigger value="approved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden sm:block">Đã hoàn tiền</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden sm:block">Từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Tìm theo Mã đơn hàng, Tên Người mua..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Tìm kiếm</Button>
            <Button variant="outline">Mở rộng</Button>
          </div>

          {/* Table Headers */}
          <div className="border border-border rounded-lg">
            <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b border-border font-medium text-sm">
              <div>Sản phẩm</div>
              <div>Mã đơn hàng</div>
              <div>Lý do</div>
              <div>Lý do chi tiết</div>
              <div>Phương thức ăn cho Người mua</div>
              <div>Trạng thái</div>
              <div>Thao tác</div>
            </div>

            {/* Empty State */}
            {returns.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">0 Yêu cầu</p>
                <p className="text-sm text-muted-foreground">Không có yêu cầu trả hàng hoàn tiền</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có yêu cầu đang chờ xem xét</p>
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có yêu cầu đã hoàn tiền</p>
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có yêu cầu bị từ chối</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

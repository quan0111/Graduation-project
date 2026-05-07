import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'

export function ProductsManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Sản phẩm</h2>
        <Button className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Thêm 1 sản phẩm mới
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full border-b border-border grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 bg-transparent">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Tất cả</TabsTrigger>
          <TabsTrigger value="active" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Đang hoạt động (0)</TabsTrigger>
          <TabsTrigger value="violation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent">Vi phạm (0)</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden sm:block">Chờ duyệt (0)</TabsTrigger>
          <TabsTrigger value="inactive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent hidden lg:block">Chưa được đăng (0)</TabsTrigger>
        </TabsList>

        {/* All Products Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input 
                placeholder="Tìm Tên sản phẩm, SKU sản phẩm..." 
                className="w-full"
              />
            </div>
            <Button variant="outline">Cài đặt</Button>
          </div>
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">Không tìm thấy sản phẩm</p>
            <Button className="bg-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm mới
            </Button>
          </div>
        </TabsContent>

        {/* Active Products Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input placeholder="Tìm sản phẩm..." className="w-full" />
            </div>
          </div>
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có sản phẩm đang hoạt động</p>
          </div>
        </TabsContent>

        {/* Violation Products Tab */}
        <TabsContent value="violation" className="space-y-4">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có sản phẩm vi phạm</p>
          </div>
        </TabsContent>

        {/* Pending Products Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có sản phẩm chờ duyệt</p>
          </div>
        </TabsContent>

        {/* Inactive Products Tab */}
        <TabsContent value="inactive" className="space-y-4">
          <div className="border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Không có sản phẩm chưa đăng</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Package, 
  Filter,
  ArrowUpDown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGetShopByOwnerId } from '@/modules/shop/api/myshop'
import { useGetSellerProducts, useDeleteProduct } from '../api/product'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function ProductsManagement() {
  const navigate = useNavigate()
  const { data: shop } = useGetShopByOwnerId()
  const { data: products = [], isLoading } = useGetSellerProducts(shop?.id || 0)
  const deleteMutation = useDeleteProduct()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Filter products by status
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'active') return matchesSearch && product.status === 'ACTIVE'
    if (activeTab === 'violation') return matchesSearch && product.status === 'BANNED'
    if (activeTab === 'pending') return matchesSearch && product.status === 'INACTIVE'
    if (activeTab === 'inactive') return matchesSearch && product.status === 'INACTIVE'
    
    return matchesSearch
  })

  // Count products by status
  const counts = {
    active: products.filter(p => p.status === 'ACTIVE').length,
    violation: products.filter(p => p.status === 'BANNED').length,
    pending: products.filter(p => p.status === 'INACTIVE').length,
    inactive: products.filter(p => p.status === 'INACTIVE').length,
  }

  const handleDelete = async (productId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    
    try {
      await deleteMutation.mutateAsync(productId)
      toast.success('Xóa sản phẩm thành công')
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý sản phẩm</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {products.length} sản phẩm trong shop của bạn
          </p>
        </div>
        <Button 
          className="bg-primary text-white hover:bg-primary/90"
          onClick={() => navigate('/seller/new-product')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm theo tên sản phẩm, SKU..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sắp xếp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 overflow-x-auto">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 h-auto"
          >
            Tất cả
            <Badge variant="secondary" className="ml-2 h-5">
              {products.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 h-auto"
          >
            Đang bán
            <Badge variant="secondary" className="ml-2 h-5">
              {counts.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="violation"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 h-auto"
          >
            Vi phạm
            <Badge variant="secondary" className="ml-2 h-5">
              {counts.violation}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 h-auto"
          >
            Chờ duyệt
            <Badge variant="secondary" className="ml-2 h-5">
              {counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="inactive"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 h-auto"
          >
            Tạm dừng
            <Badge variant="secondary" className="ml-2 h-5">
              {counts.inactive}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Product Table */}
        <div className="mt-6">
          {isLoading ? (
            <div className="border rounded-lg p-12 text-center">
              <div className="animate-pulse">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Đang tải sản phẩm...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {searchTerm 
                    ? 'Thử tìm kiếm với từ khóa khác' 
                    : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => navigate('/seller/new-product')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm mới
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Sản phẩm
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                          Giá
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">
                          Tồn kho
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProducts.map((product) => (
                        <tr 
                          key={product.id} 
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {product.images?.[0]?.url ? (
                                  <img 
                                    src={product.images[0].url} 
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-full w-full p-2 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate max-w-[200px]">
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="font-medium">
                              {product.price.toLocaleString('vi-VN')} ₫
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <span>{product.stock}</span>
                              {product.stock === 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Hết hàng
                                </Badge>
                              )}
                              {product.stock > 0 && product.stock <= 10 && (
                                <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                                  Sắp hết
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation()
                                  navigate(`/products/${product.id}`)
                                }}
                                title="Xem sản phẩm"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation()
                                  navigate(`/seller/products/${product.id}/edit`)
                                }}
                                title="Sửa sản phẩm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation()
                                  handleDelete(product.id)
                                }}
                                title="Xóa sản phẩm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: 'Đang bán', variant: 'default' },
    INACTIVE: { label: 'Tạm dừng', variant: 'secondary' },
    BANNED: { label: 'Vi phạm', variant: 'destructive' },
  }

  const config = statusConfig[status] || { label: status, variant: 'outline' as const }

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  )
}

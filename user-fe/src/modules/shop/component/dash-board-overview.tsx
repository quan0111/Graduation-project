import { Card } from '@/components/ui/card'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface DashboardStats {
  waitingPickup: number
  processed: number
  returns: number
  blockedProducts: number
}

interface Props {
  stats: DashboardStats
}

export function DashboardOverview({ stats }: Props) {
  const chartData = [
    { name: 'T2', sales: 2000, visitors: 1200 },
    { name: 'T3', sales: 1800, visitors: 1100 },
    { name: 'T4', sales: 2500, visitors: 1400 },
    { name: 'T5', sales: 2200, visitors: 1300 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 border border-border">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">Chờ Lấy Hàng</p>
            <p className="text-4xl font-bold text-primary">{stats.waitingPickup}</p>
          </div>
        </Card>
        <Card className="p-6 border border-border">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">Đã Xử Lý</p>
            <p className="text-4xl font-bold text-primary">{stats.processed}</p>
          </div>
        </Card>
        <Card className="p-6 border border-border">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">Đơn Trả hàng/Hoàn Tiền</p>
            <p className="text-4xl font-bold text-primary">{stats.returns}</p>
          </div>
        </Card>
        <Card className="p-6 border border-border">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">Sản Phẩm Bị Khóa</p>
            <p className="text-4xl font-bold text-primary">{stats.blockedProducts}</p>
          </div>
        </Card>
      </div>

      {/* Sales Analytics */}
      <Card className="p-6 border border-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-foreground">Phân Tích Bán Hàng</h3>
          <a href="#" className="text-primary text-sm">Xem thêm →</a>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-1">Doanh số</p>
            <p className="text-2xl font-bold text-foreground">₫0</p>
            <p className="text-xs text-muted-foreground">- 0.00%</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-1">Lượt truy cập</p>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">- 0.00%</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-1">Lượt nhấp sản phẩm</p>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">- 0.00%</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-1">Đơn hàng</p>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">- 0.00%</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-1">Tỷ lệ chuyển đổi đơn hàng</p>
            <p className="text-2xl font-bold text-foreground">0.00%</p>
            <p className="text-xs text-muted-foreground">- 0.00%</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#ff6b35" strokeWidth={2} />
            <Line type="monotone" dataKey="visitors" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
export function OrderStats() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">

      <Card>
        <CardHeader>
          <Label className="text-muted-foreground">Tổng đơn hàng</Label>
        </CardHeader>
        <CardContent className="pt-6">2,450</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Label className="font-bold">Doanh thu</Label>
        </CardHeader>
        <CardContent className="pt-6 text-success">8.2B</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Label className="font-bold">Đơn hàng đang xử lý</Label>
        </CardHeader>
        <CardContent className="pt-6 text-primary">127</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Label className="font-bold">Đơn hàng bị hủy</Label>
        </CardHeader>
        <CardContent className="pt-6 text-warning">45</CardContent>
      </Card>
    </div>
  );
}
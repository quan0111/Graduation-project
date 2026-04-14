import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function ReviewStats() {
  return (
    <div className="grid grid-cols-4 gap-10 mb-8">
      <Card>
        <CardHeader className="pt-6">
          <Label className="text-sm font-bold ">Tổng đánh giá</Label>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-foreground mt-2">12,450</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pt-6">
          <Label className="text-sm font-bold ">Chờ duyệt</Label>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-warning mt-2">342</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pt-6">
          <Label className="text-sm font-bold ">Đã duyệt</Label>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-success mt-2">12,096</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pt-6">
          <Label className="text-sm font-bold  ">Đã từ chối</Label>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-destructive mt-2">12</div>
        </CardContent>
      </Card>
    </div>
  );
}
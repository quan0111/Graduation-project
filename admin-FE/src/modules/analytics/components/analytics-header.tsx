import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnalyticsHeader({ period, setPeriod }: any) {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Thống kê & Doanh thu
        </h1>
        <p className="text-muted-foreground">
          Phân tích chi tiết doanh thu và hiệu suất
        </p>
      </div>

      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">7 ngày qua</SelectItem>
          <SelectItem value="30days">30 ngày qua</SelectItem>
          <SelectItem value="3months">3 tháng qua</SelectItem>
          <SelectItem value="6months">6 tháng qua</SelectItem>
          <SelectItem value="1year">1 năm qua</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
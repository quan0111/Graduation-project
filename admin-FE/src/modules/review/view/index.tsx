import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { ReviewStats } from "../components/stats-card";
import { ReviewFilter } from "../components/search-filter-review";
import { reviewColumns } from "../components/review-collum"
import { Label } from "@/components/ui/label";
const reviews = [
  {
    id: 1,
    productName: 'iPhone 15 Pro',
    reviewer: 'Nguyễn Văn A',
    rating: 5,
    title: 'Sản phẩm tuyệt vời!',
    content: 'Chất lượng rất tốt, giao hàng nhanh, sẽ mua lại',
    status: 'Đã duyệt',
    date: '2024-03-20',
  },
  {
    id: 2,
    productName: 'MacBook Pro 14',
    reviewer: 'Trần Thị B',
    rating: 4,
    title: 'Rất hài lòng',
    content: 'Máy chạy mượt, pin tốt, giá hơi cao một chút',
    status: 'Đã duyệt',
    date: '2024-03-19',
  },
  {
    id: 3,
    productName: 'Samsung Galaxy S24',
    reviewer: 'Lê Văn C',
    rating: 3,
    title: 'Bình thường',
    content: 'Máy ổn, nhưng camera không như kỳ vọng',
    status: 'Chờ duyệt',
    date: '2024-03-18',
  },
  {
    id: 4,
    productName: 'iPad Air',
    reviewer: 'Phạm Văn D',
    rating: 2,
    title: 'Không hài lòng',
    content: 'Giá cao, hiệu năng không tương xứng',
    status: 'Chờ duyệt',
    date: '2024-03-17',
  },
  {
    id: 5,
    productName: 'AirPods Pro',
    reviewer: 'Hoàng Thị E',
    rating: 5,
    title: 'Tốt lắm!',
    content: 'Âm thanh tuyệt vời, chống ồn hiệu quả',
    status: 'Đã duyệt',
    date: '2024-03-16',
  },
];
export default function ReviewsPage() {
  const [search, setSearch] = useState("");

  const filtered = reviews.filter(
    (r) =>
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-auto p-6 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Quản lý Đánh giá
            </h1>
            <p className="text-muted-foreground">
              Quản lý toàn bộ đánh giá của khách hàng
            </p>
          </div>

      <ReviewStats />

      <div className="mb-4 flex justify-end">
        <ReviewFilter value={search} onChange={setSearch} />
      </div>

      <DataTable
        data={filtered}
        columns={reviewColumns}
        title="Danh sách đánh giá"
      />
    </main>
  );
}

export const reviewColumns = (onApprove: any, onDelete: any) => [
  {
    key: "productName",
    label: "Sản phẩm",
  },
  {
    key: "reviewer",
    label: "Người đánh giá",
  },
  {
    key: "rating",
    label: "Rating",
    render: (r: any) => "⭐".repeat(r.rating),
  },
  {
    key: "content",
    label: "Nội dung",
  },
  {
    key: "actions",
    label: "Thao tác",
    render: (r: any) => (
      <div className="flex gap-2">
        <button onClick={() => onApprove(r)}>Duyệt</button>
        <button onClick={() => onDelete(r)}>Xóa</button>
      </div>
    ),
  },
];
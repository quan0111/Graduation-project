

import { useState } from 'react';
import { DataTable } from "@/components/common/data-table";
import { orderColumns } from "../components/order-collums";
import { OrderStats } from "../components/order-stats";
import { OrderFilter } from "../components/search-filter-order";
import { OrderDetailModal } from "../components/order-detail-modal";
const orders = [
  {
    id: 'ORD-001',
    orderId: '#12345',
    shop: 'Shop A',
    customer: 'Nguyễn Văn A',
    total: 1250000,
    items: 3,
    status: 'Đã giao',
    date: '2024-03-20',
  },
  {
    id: 'ORD-002',
    orderId: '#12346',
    shop: 'Shop B',
    customer: 'Trần Thị B',
    total: 890000,
    items: 2,
    status: 'Đang giao',
    date: '2024-03-19',
  },
  {
    id: 'ORD-003',
    orderId: '#12347',
    shop: 'Shop C',
    customer: 'Lê Văn C',
    total: 2100000,
    items: 5,
    status: 'Chưa thanh toán',
    date: '2024-03-18',
  },
  {
    id: 'ORD-004',
    orderId: '#12348',
    shop: 'Shop A',
    customer: 'Phạm Văn D',
    total: 560000,
    items: 1,
    status: 'Đã hủy',
    date: '2024-03-17',
  },
  {
    id: 'ORD-005',
    orderId: '#12349',
    shop: 'Shop D',
    customer: 'Hoàng Thị E',
    total: 3200000,
    items: 8,
    status: 'Đã giao',
    date: '2024-03-16',
  },
];



export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const handleView = (order: any) => {
  setSelectedOrder(order);
  setOpen(true);
};

const handleDelete = (order: any) => {
  console.log("delete", order.id);
};

const handleUpdateStatus = (id: string, status: string) => {
  console.log("update", id, status);
};
const columns = orderColumns(
  handleView,
  handleDelete,
  handleUpdateStatus
);
  const filtered = orders.filter(
    (o) =>
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.shop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    
    <main className="flex-1 overflow-auto p-6 w-full">

      <OrderStats />

      <div className="flex justify-end mb-4">
        <OrderFilter value={search} onChange={setSearch} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        title="Danh sách đơn hàng"
      />
      <OrderDetailModal
        open={open}
        onClose={() => setOpen(false)}
        order={selectedOrder}
      />
    </main>
  );
}

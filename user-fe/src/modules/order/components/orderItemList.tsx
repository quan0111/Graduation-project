export const OrderItemList = ({ items }) => {
  return items.map((item, i) => (
    <div key={i}>
      {item.name} x{item.quantity}
    </div>
  ));
};
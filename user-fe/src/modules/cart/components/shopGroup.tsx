// blocks/ShopGroup.tsx
import { CartItem } from "./CartItem";

export const ShopGroup = ({
  shopName,
  items,
  selected,
  onSelect,
  onQty,
  onRemove
}) => {
  return (
    <div className="bg-white rounded-lg mb-4">

      <div className="p-3 bg-muted font-medium">
        {shopName}
      </div>

      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          selected={selected.includes(item.id)}
          onSelect={onSelect}
          onQty={onQty}
          onRemove={onRemove}
        />
      ))}

    </div>
  );
};
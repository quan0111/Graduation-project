// sections/CartList.tsx
import { ShopGroup } from "../blocks/ShopGroup";

export const CartList = (props) => {
  const { grouped } = props;

  return Object.entries(grouped).map(([shopId, items]) => (
    <ShopGroup
      key={shopId}
      shopName={items[0].shopName}
      items={items}
      {...props}
    />
  ));
};
// sections/CompareTable.tsx

import { ProductCardCompare } from "./productCard";
import { AddProductCard } from "./addProductCard";
import { SpecRow } from "./specRow";

interface Product {
  id: string | number;
  name: string;
  price: number;
  rating?: number;
  image?: string;
  specs?: Record<string, string | number>;
}

interface CompareTableProps {
  list: Product[];
  allSpecs: string[];
  onRemove: (id: string | number) => void;
  onAdd: () => void;
}

export const CompareTable: React.FC<CompareTableProps> = ({
  list,
  allSpecs,
  onRemove,
  onAdd,
}) => {
  if (!list || list.length === 0) return null;

  // 👉 chọn best theo rating (có thể custom sau)
  const bestProduct = list.reduce((best, p) =>
    (p.rating ?? 0) > (best.rating ?? 0) ? p : best
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-separate border-spacing-0">

        {/* HEADER */}
        <thead>
          <tr className="sticky top-0 bg-white z-10 shadow-sm">
            <th className="w-40 p-3 text-left bg-white">
              Sản phẩm
            </th>

            {list.map((p) => (
              <th key={p.id} className="p-3 align-top min-w-[220px]">
                <ProductCardCompare
                  product={p}
                  onRemove={onRemove}
                />
              </th>
            ))}

            {list.length < 4 && (
              <th className="p-3 min-w-[220px]">
                <AddProductCard onAdd={onAdd} />
              </th>
            )}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {allSpecs.map((spec) => (
            <SpecRow
              key={spec}
              spec={spec}
              list={list}
              bestId={bestProduct.id}
            />
          ))}
        </tbody>

      </table>
    </div>
  );
};
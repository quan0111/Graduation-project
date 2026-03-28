// sections/CompareTable.tsx
import { ProductCardCompare } from "../blocks/ProductCardCompare";
import { AddProductCard } from "../blocks/AddProductCard";
import { SpecRow } from "../blocks/SpecRow";

export const CompareTable = ({ list, allSpecs, onRemove, onAdd }) => {
  return (
    <div className="overflow-x-auto">

      <table className="w-full">

        {/* HEADER */}
        <thead>
          <tr>
            <th className="w-40">Sản phẩm</th>

            {list.map(p => (
              <th key={p.id}>
                <ProductCardCompare product={p} onRemove={onRemove}/>
              </th>
            ))}

            {list.length < 4 && (
              <th>
                <AddProductCard onAdd={onAdd}/>
              </th>
            )}

          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {allSpecs.map(spec => (
            <SpecRow key={spec} spec={spec} list={list}/>
          ))}
        </tbody>

      </table>

    </div>
  );
};
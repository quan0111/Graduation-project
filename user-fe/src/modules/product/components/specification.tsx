// components/product-detail/ProductAttributes.tsx
import type { IProductAttribute } from "../types";

export const ProductAttributes = ({ attrs }: { attrs?: IProductAttribute[] }) => {
  if (!attrs?.length) return null;

  return (
    <div className="space-y-2">
      {attrs.map((a) => (
        <div key={a.id} className="flex justify-between border-b py-2">
          <span className="text-muted">{a.key}</span>
          <span className="font-medium">{a.value}</span>
        </div>
      ))}
    </div>
  );
};
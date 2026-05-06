// components/specification.tsx

import type { IProductAttribute } from "../types";

export const ProductAttributes = ({
  attrs,
}: {
  attrs?: IProductAttribute[];
}) => {

  if (!attrs?.length) return null;

  return (
    <div className="space-y-6">

      {attrs.map((a) => (
        <div
          key={a.id}
          className="grid grid-cols-12"
        >

          <div className="col-span-2 text-[#757575]">
            {a.key}
          </div>

          <div className="col-span-10">
            {a.value}
          </div>

        </div>
      ))}

    </div>
  );
};
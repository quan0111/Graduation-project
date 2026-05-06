export function VariantTable({
  variants,
  setVariants,
  enableShipping
}: any) {

  const update = (i: number, field: string, value: any) => {
    const copy = [...variants];
    copy[i][field] = value;
    setVariants(copy);
  };

  return (
    <table className="w-full mt-4">
      <thead>
        <tr>
          <th>Variant</th>
          <th>Giá</th>
          <th>Stock</th>
          {enableShipping && <th>Weight</th>}
          {enableShipping && <th>Size</th>}
        </tr>
      </thead>

      <tbody>
        {variants.map((v: any, i: number) => (
          <tr key={i}>
            <td>{JSON.stringify(v.attributes)}</td>

            <td>
              <input
                value={v.price}
                onChange={e => update(i, "price", Number(e.target.value))}
              />
            </td>

            <td>
              <input
                value={v.stock}
                onChange={e => update(i, "stock", Number(e.target.value))}
              />
            </td>

            {enableShipping && (
              <td>
                <input
                  value={v.weight}
                  onChange={e => update(i, "weight", e.target.value)}
                />
              </td>
            )}

            {enableShipping && (
              <td>
                <input
                  value={v.length}
                  onChange={e => update(i, "length", e.target.value)}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
import { Trash2 } from 'lucide-react';

export function VariantTable({ variants, removeVariant }: any) {
  return (
    <table className="w-full">
      <tbody>
        {variants.map((v: any) => (
          <tr key={v.id}>
            <td>{v.color}</td>
            <td>{v.size}</td>
            <td>{v.price}</td>
            <td>
              <button onClick={() => removeVariant(v.id)}>
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
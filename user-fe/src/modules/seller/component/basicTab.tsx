import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ProductBasicTab({
  productName,
  setProductName,
  setCategoryId,
  attributes,
  setAttributes,
}: any) {

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', values: [] }]);
  };

  const updateAttr = (i: number, field: string, value: any) => {
    const copy = [...attributes];
    copy[i][field] = value;
    setAttributes(copy);
  };

  const addValue = (i: number) => {
    const copy = [...attributes];
    copy[i].values.push('');
    setAttributes(copy);
  };

  return (
    <div className="space-y-6">

      <div>
        <label>Tên sản phẩm *</label>
        <Input
          value={productName}
          onChange={e => setProductName(e.target.value)}
        />
      </div>

      <div>
        <label>Category</label>
        <Input onChange={e => setCategoryId(Number(e.target.value))} />
      </div>

      {/* ATTRIBUTE */}
      <div>
        <h3 className="font-semibold">Thuộc tính</h3>

        {attributes.map((attr: any, i: number) => (
          <div key={i} className="border p-3 mt-2 rounded">
            <Input
              placeholder="Tên (Color, Size)"
              value={attr.name}
              onChange={e => updateAttr(i, "name", e.target.value)}
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {attr.values.map((v: string, j: number) => (
                <Input
                  key={j}
                  value={v}
                  onChange={e => {
                    const copy = [...attributes];
                    copy[i].values[j] = e.target.value;
                    setAttributes(copy);
                  }}
                />
              ))}
            </div>

            <Button size="sm" onClick={() => addValue(i)}>
              + Value
            </Button>
          </div>
        ))}

        <Button onClick={addAttribute} className="mt-2">
          + Thêm thuộc tính
        </Button>
      </div>
    </div>
  );
}
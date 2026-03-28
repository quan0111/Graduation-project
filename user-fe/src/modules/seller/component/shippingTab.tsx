import { Input } from '@/components/ui/input';

export function ProductShippingTab({
  weight,
  setWeight,
}: any) {
  return (
    <div>
      <label>Cân nặng *</label>
      <Input
        value={weight}
        onChange={e => setWeight(e.target.value)}
      />
    </div>
  );
}
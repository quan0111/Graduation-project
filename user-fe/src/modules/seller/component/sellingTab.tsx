import { Button } from '@/components/ui/button';
import { VariantTable } from './variantTable';

export function ProductSellingTab({
  variants,
  setVariants,
  attributes,
  enableShipping
}: any) {

  const generateVariants = () => {
    if (attributes.length === 0) return;

    const combine = (arr: any[], prefix = {}) => {
      if (!arr.length) return [prefix];

      const [first, ...rest] = arr;

      return first.values.flatMap((v: string) =>
        combine(rest, { ...prefix, [first.name]: v })
      );
    };

    const combos = combine(attributes);

    const newVariants = combos.map((c: any) => ({
      attributes: c,
      price: 0,
      stock: 0,
      weight: '',
      length: '',
    }));

    setVariants(newVariants);
  };

  return (
    <div>
      <Button onClick={generateVariants}>
        Generate Variants
      </Button>

      <VariantTable
        variants={variants}
        setVariants={setVariants}
        enableShipping={enableShipping}
      />
    </div>
  );
}
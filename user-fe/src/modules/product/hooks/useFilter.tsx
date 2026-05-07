import { useState } from 'react';

export function useProductFilter() {
  const [filters, setFilters] = useState({
    priceRanges: [] as number[],
    ratings: [] as number[],
    vendors: [] as string[],
  });

  const toggleFilter = (type: keyof typeof filters, value: any) => {
    setFilters(prev => {
      const list = prev[type] as any[];
      const exists = list.includes(value);

      return {
        ...prev,
        [type]: exists
          ? prev[type].filter(v => v !== value)
          : [...prev[type], value],
      };
    });
  };

  return { filters, toggleFilter };
}
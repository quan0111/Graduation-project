export type PriceRange = {
  min: number;
  max: number;
  label: string;
};

export interface Filters {
  price: PriceRange[];
  rating?: number;
  shop_ids: number[];
}
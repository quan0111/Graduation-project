import type { IProduct } from "../types";

export const productUtils = {
  formatPrice: (price: number): string => {
    return price.toLocaleString('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0 
    });
  },

  calculateDiscount: (originalPrice: number, currentPrice: number): number => {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  },

  isOnSale: (product: IProduct): boolean => {
    const p = product as IProduct & { originalPrice?: number };
    return !!p.originalPrice && product.price < p.originalPrice;
  },

  isInStock: (product: IProduct): boolean => {
    return product.variants?.some(v => v.stock > 0) ?? false;
  },

  getRatingColor: (rating: number): string => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  },

  formatRating: (rating: number): string => {
    return rating.toFixed(1);
  },
};
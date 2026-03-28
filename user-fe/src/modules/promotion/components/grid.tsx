// PromotionGrid.tsx

import React from "react";
import { PromotionCard } from "./PromotionCard";

type Promotion = {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  code: string;
  used: number;
  total: number;
  validUntil: string | Date;
};

type PromotionGridProps = {
  list: Promotion[];
  copied: string | null;
  onCopy: (code: string) => void;
};

export const PromotionGrid: React.FC<PromotionGridProps> = ({
  list,
  copied,
  onCopy,
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((p: Promotion) => (
        <PromotionCard
          key={p.id}
          promo={p}
          copied={copied}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
};
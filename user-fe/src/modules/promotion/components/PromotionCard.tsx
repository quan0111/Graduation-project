// PromotionCard.tsx

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ProgressBar } from "./progressBar";
import { CopyCodeButton } from "./copyCodeButton";
import { formatDate } from "@/lib/date";

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

type PromotionCardProps = {
  promo: Promotion;
  copied: string | null;
  onCopy: (code: string) => void;
};

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promo,
  copied,
  onCopy,
}) => {
  const percent = (promo.used / promo.total) * 100;
  const danger = percent > 80;

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-lg transition">
      
      {/* IMAGE */}
      <div className="relative h-40">
        <img
          src={promo.image}
          alt={promo.title}
          className="w-full h-full object-cover"
        />

        <Badge className="absolute top-2 left-2 bg-red-500">
          {promo.discount}
        </Badge>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="font-bold">{promo.title}</h3>
        <p className="text-sm text-muted">{promo.description}</p>

        {/* PROGRESS */}
        <div className="mt-3">
          <ProgressBar value={percent} isDanger={danger} />
        </div>

        {/* EXPIRE */}
        <div className="flex items-center text-xs mt-2">
          <Clock size={12} />
          <span className="ml-1">
            {formatDate(promo.validUntil)}
          </span>
        </div>

        {/* CODE */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 border-dashed border rounded px-2 py-1 truncate">
            {promo.code}
          </div>

          <CopyCodeButton
            code={promo.code}
            copied={copied}
            onCopy={onCopy}
          />
        </div>
      </div>
    </div>
  );
};

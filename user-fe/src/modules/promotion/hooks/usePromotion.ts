// hooks/usePromotions.ts
import { useState, useMemo } from "react";

export const usePromotions = (data) => {
  const [category, setCategory] = useState("Tất cả");
  const [copied, setCopied] = useState(null);

  const filtered = useMemo(() => {
    return category === "Tất cả"
      ? data
      : data.filter(p => p.category === category || p.category === "Tất cả");
  }, [category, data]);

  const copy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return {
    category,
    setCategory,
    filtered,
    copied,
    copy
  };
};
import { Search } from "lucide-react";

interface CatalogSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const PLACEHOLDER = "T\u00ecm theo t\u00ean s\u1ea3n ph\u1ea9m, th\u01b0\u01a1ng hi\u1ec7u...";

export const CatalogSearch = ({ value, onChange }: CatalogSearchProps) => {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        placeholder={PLACEHOLDER}
        className="h-11 w-full rounded-2xl border border-orange-100 bg-white pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none ring-orange-300 transition placeholder:text-slate-400 focus:ring-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  const generatePages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) pages.push("...");

    for (let i = page - 1; i <= page + 1; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const pages = generatePages();

  return (
    <div className="flex justify-center mt-12">
      <div className="flex items-center gap-2 bg-white border rounded-2xl shadow-sm px-3 py-2">
        
        {/* Prev */}
        <Button
          variant="ghost"
          size="icon"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="rounded-xl hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </Button>

        {/* Pages */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={i}
              className="px-2 text-gray-400 text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`
                w-9 h-9 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  p === page
                    ? "bg-black text-white shadow scale-105"
                    : "hover:bg-gray-100 text-gray-700"
                }
              `}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-xl hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
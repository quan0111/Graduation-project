'use client';
import type { ReactNode } from "react";
import {  useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;

  // new props
  pageSize?: number;
  onRowClick?: (row: T) => void;

  // server-side
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
};

export function DataTable<T extends { id?: number | string }>({
  data,
  columns,
  title,
  description,
  pageSize = 10,
  onRowClick,

  total,
  page: controlledPage,
  onPageChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<Set<any>>(new Set());
  const [internalPage, setInternalPage] = useState(1);

  const page = controlledPage ?? internalPage;

  // 🔥 SORT
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortAsc]);

  // 🔥 PAGINATION (client)
  const paginatedData = useMemo(() => {
    if (onPageChange) return sortedData; // server-side

    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, onPageChange]);

  const totalItems = total ?? data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // 🔥 CHECKBOX
  const toggleRow = (id: any) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const toggleAll = () => {
    if (selected.size === paginatedData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedData.map((r: any) => r.id)));
    }
  };

  // 🔥 SORT CLICK
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const changePage = (p: number) => {
    if (onPageChange) onPageChange(p);
    else setInternalPage(p);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description || `Tổng cộng ${totalItems} bản ghi`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            
            {/* HEADER */}
            <thead className="bg-muted">
              <tr className="border-b border-border">
                
                {/* checkbox all */}
                <th className="px-4">
                  <input
                    type="checkbox"
                    onChange={toggleAll}
                    checked={
                      selected.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                  />
                </th>

                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    onClick={() =>
                      col.sortable && handleSort(String(col.key))
                    }
                    className={`text-left py-3 px-4 font-semibold text-foreground ${
                      col.sortable ? "cursor-pointer" : ""
                    }`}
                  >
                    {col.label}

                    {sortKey === col.key && (
                      <span className="ml-1">
                        {sortAsc ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className="border-b border-border hover:bg-card/50 transition cursor-pointer"
                >
                  <td className="px-4">
                    <input
                      type="checkbox"
                      checked={selected.has((row as any).id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRow((row as any).id);
                      }}
                    />
                  </td>

                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="py-4 px-4 text-foreground"
                    >
                      {col.render
                        ? col.render(row)
                        : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
          >
            Prev
          </Button>

          <span className="text-sm self-center">
            {page} / {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => changePage(page + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
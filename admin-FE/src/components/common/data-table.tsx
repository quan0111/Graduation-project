'use client';
import type { ReactNode } from "react";
import {  useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
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
  onSelectChange?: (ids: any[]) => void;
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
  onSelectChange,
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
  const handleExport = () => {
  // map data theo columns (chỉ lấy field hiển thị)
  const exportData = data.map((row: any) => {
    const obj: any = {};

    columns.forEach((col) => {
      obj[col.label] = row[col.key as string];
    });

    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, `${title || "data"}.xlsx`);
};
  // 🔥 PAGINATION (client)
  const paginatedData = useMemo(() => {
    if (onPageChange) return sortedData; // server-side

    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, onPageChange]);

  const totalItems = total ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setSelected(new Set());
    onSelectChange?.([]);
  }, [page, data, onSelectChange]);

  // 🔥 CHECKBOX
  const toggleRow = (id: any) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
    onSelectChange?.(Array.from(newSet));
  };

  const toggleAll = () => {
    if (selected.size === paginatedData.length) {
      setSelected(new Set());
      onSelectChange?.([]);
    } else {
      const newSet = new Set(paginatedData.map((r: any) => r.id));
      setSelected(newSet);
      onSelectChange?.(Array.from(newSet));
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
    <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description || `Tổng cộng ${totalItems} bản ghi`}
          </CardDescription>
        </div>

        <Button size="sm" onClick={handleExport}>
          Export Excel
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            
<thead className="bg-muted">
  <tr className="border-b border-border">
    
    {/* checkbox */}
    <th className="px-4 text-center">
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
        className={`text-center py-3 px-4 font-semibold text-foreground ${
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

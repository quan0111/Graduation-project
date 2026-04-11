import { useMemo } from "react";

type FilterConfig<T> = {
  searchTerm?: string;
  searchFields?: (keyof T)[];
  filters?: Partial<Record<keyof T, any>>;
};

export function useFilter<T>(
  data: T[],
  config: FilterConfig<T>
) {
  const { searchTerm = "", searchFields = [], filters = {} } = config;

  return useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchFields.length === 0 ||
        searchFields.some((field) =>
          String(item[field] ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );

      const matchesFilters = Object.entries(filters).every(
        ([key, value]) => {
          if (!value || value === "all") return true;
          return (item as any)[key] === value;
        }
      );

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, JSON.stringify(filters)]);
}
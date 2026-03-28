type CategoryFilterProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  categories: T[];
};

export const CategoryFilter = <T extends string | number>({
  value,
  onChange,
  categories,
}: CategoryFilterProps<T>) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((c) => (
        <button
          key={String(c)}
          onClick={() => onChange(c)}
          className={`
            px-4 py-2 rounded-full text-sm transition
            ${
              value === c
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/70"
            }
          `}
        >
          {c}
        </button>
      ))}
    </div>
  );
};
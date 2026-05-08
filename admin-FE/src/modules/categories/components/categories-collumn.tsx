import { CategoryActions } from "./category-action";
import type { ICategory } from "../types";
export const categoryColumns = (
  onEdit: (c: ICategory) => void,
  onDelete: (c: ICategory) => void
) => [
  {
    key: "name",
    label: "Tên danh mục",
    render: (c: ICategory) => (
      <div>
        <p className="font-medium">{c.name}</p>

        {/* hiển thị parent */}
        {c.parent && (
          <p className="text-xs text-muted-foreground">
            Parent: {c.parent.name}
          </p>
        )}
      </div>
    ),
  },

  {
    key: "slug",
    label: "Slug",
    render: (c: ICategory) => c.slug || "-",
  },

  {
    key: "children",
    label: "Danh mục con",
    render: (c: ICategory) => (
      <div className="text-center">
        {c.children?.length || 0}
      </div>
    ),
  },



  {
    key: "actions",
    label: "Thao tác",
    render: (c: ICategory) => (
      <CategoryActions
        row={c}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
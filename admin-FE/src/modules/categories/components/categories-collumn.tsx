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
        {c.Parent && (
          <p className="text-xs text-muted-foreground">
            Parent: {c.Parent.name}
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
        {c.Children?.length || 0}
      </div>
    ),
  },

  {
    key: "created_at",
    label: "Ngày tạo",
    render: (c: ICategory) => (
      <div className="text-center">
        {new Date(c.created_at).toLocaleDateString()}
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
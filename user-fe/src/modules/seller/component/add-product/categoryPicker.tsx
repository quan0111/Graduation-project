import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, FolderTree, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Category } from "../../types/addproduct";

type Props = {
  categories: Category[];
  value: number | "";
  onChange: (value: number | "") => void;
};

type CategoryNode = Category & {
  children: CategoryNode[];
};

const getParentId = (category: Category) => category.parentId ?? category.parent_id ?? null;

const getChildren = (category: Category): Category[] => category.children ?? category.Children ?? [];

const buildCategoryTree = (categories: Category[]) => {
  const nodeMap = new Map<number, CategoryNode>();

  categories.forEach((category) => {
    nodeMap.set(category.id, {
      ...category,
      children: [],
    });
  });

  categories.forEach((category) => {
    const node = nodeMap.get(category.id);
    if (!node) return;

    getChildren(category).forEach((child) => {
      if (!nodeMap.has(child.id)) {
        nodeMap.set(child.id, {
          ...child,
          children: [],
        });
      }
    });
  });

  categories.forEach((category) => {
    const node = nodeMap.get(category.id);
    if (!node) return;

    getChildren(category).forEach((child) => {
      const childNode = nodeMap.get(child.id);
      if (childNode && !node.children.some((item) => item.id === childNode.id)) {
        node.children.push(childNode);
      }
    });
  });

  nodeMap.forEach((node) => {
    const parentId = getParentId(node);
    if (!parentId) return;

    const parent = nodeMap.get(parentId);
    if (parent && !parent.children.some((item) => item.id === node.id)) {
      parent.children.push(node);
    }
  });

  const roots = Array.from(nodeMap.values()).filter((node) => !getParentId(node) || !nodeMap.has(Number(getParentId(node))));
  const sortByName = (nodes: CategoryNode[]) => {
    nodes.sort((left, right) => left.name.localeCompare(right.name, "vi"));
    nodes.forEach((node) => sortByName(node.children));
  };

  sortByName(roots);
  return { roots, nodeMap };
};

const getCategoryPath = (categoryId: number | "", nodeMap: Map<number, CategoryNode>) => {
  if (!categoryId) return [];

  const path: CategoryNode[] = [];
  let current = nodeMap.get(Number(categoryId));
  const visited = new Set<number>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    const parentId = getParentId(current);
    current = parentId ? nodeMap.get(parentId) : undefined;
  }

  return path;
};

export function CategoryPicker({ categories, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<CategoryNode[]>([]);
  const [query, setQuery] = useState("");

  const { roots, nodeMap } = useMemo(() => buildCategoryTree(categories), [categories]);
  const selectedPath = useMemo(() => getCategoryPath(value, nodeMap), [nodeMap, value]);
  const selectedLabel = selectedPath.length ? selectedPath.map((item) => item.name).join(" / ") : "";
  const currentParent = path[path.length - 1] ?? null;
  const currentItems = currentParent ? currentParent.children : roots;
  const normalizedQuery = query.trim().toLowerCase();

  const visibleItems = useMemo(() => {
    if (!normalizedQuery) return currentItems;
    return currentItems.filter((category) => category.name.toLowerCase().includes(normalizedQuery));
  }, [currentItems, normalizedQuery]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setPath(selectedPath.slice(0, -1));
      setQuery("");
    }
  };

  const handleCategoryClick = (category: CategoryNode) => {
    if (category.children.length) {
      setPath((current) => [...current, category]);
      setQuery("");
      return;
    }

    onChange(category.id);
    setOpen(false);
  };

  const handleBack = () => {
    setPath((current) => current.slice(0, -1));
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-3xl border border-input bg-input/30 px-4 py-2 text-left text-sm outline-none transition hover:border-orange-300 hover:bg-orange-50/60 focus:border-ring focus:ring-[3px] focus:ring-ring/40"
      >
        <span className="min-w-0">
          {selectedLabel ? (
            <>
              <span className="block text-xs font-medium uppercase tracking-[0.12em] text-orange-600">Đã chọn</span>
              <span className="line-clamp-1 font-semibold text-slate-900">{selectedLabel}</span>
            </>
          ) : (
            <span className="text-slate-500">Chọn ngành hàng</span>
          )}
        </span>
        <ChevronRight className="size-4 shrink-0 text-slate-400" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl gap-4 p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <FolderTree className="size-5 text-orange-600" />
              Chọn ngành hàng
            </DialogTitle>
            <DialogDescription>
              Chọn lần lượt ngành hàng cha rồi đến ngành hàng con cuối cùng để phân loại sản phẩm chính xác.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-0 md:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="border-b border-slate-100 bg-slate-50/80 p-4 md:border-b-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Đường dẫn đã chọn</p>
              <div className="mt-3 space-y-2">
                {path.length ? (
                  path.map((category, index) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setPath(path.slice(0, index + 1))}
                      className="block w-full rounded-2xl bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      {index + 1}. {category.name}
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                    Bắt đầu từ danh mục cha.
                  </div>
                )}
              </div>

              {selectedLabel ? (
                <div className="mt-4 rounded-2xl bg-orange-50 px-3 py-3 text-sm text-orange-700">
                  <p className="font-semibold">Ngành hiện tại</p>
                  <p className="mt-1 leading-5">{selectedLabel}</p>
                </div>
              ) : null}
            </aside>

            <section className="p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="button" variant="outline" disabled={!path.length} onClick={handleBack} className="rounded-full">
                  <ChevronLeft className="size-4" />
                  Quay lại
                </Button>

                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                    placeholder={currentParent ? `Tìm trong ${currentParent.name}` : "Tìm ngành hàng cha"}
                  />
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{currentParent?.name ?? "Danh mục cha"}</p>
                  <p className="text-xs text-slate-500">
                    {visibleItems.length} ngành hàng {currentParent ? "con" : "cha"}
                  </p>
                </div>
              </div>

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {visibleItems.map((category) => {
                  const hasChildren = category.children.length > 0;
                  const isSelected = value === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left transition hover:border-orange-200 hover:bg-orange-50/70"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold text-slate-900">{category.name}</span>
                        <span className="text-xs text-slate-500">
                          {hasChildren ? `${category.children.length} ngành hàng con` : "Có thể chọn cho sản phẩm"}
                        </span>
                      </span>

                      {hasChildren ? (
                        <ChevronRight className="size-4 shrink-0 text-slate-400" />
                      ) : isSelected ? (
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white">
                          <Check className="size-4" />
                        </span>
                      ) : (
                        <span className="rounded-full border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600">
                          Chọn
                        </span>
                      )}
                    </button>
                  );
                })}

                {!visibleItems.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                    Không tìm thấy ngành hàng phù hợp.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

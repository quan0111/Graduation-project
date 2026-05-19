import { Card, CardContent } from "@/components/ui/card";

export function CategoryStats({ categories = [] }: { categories?: any[] }) {
  const total = categories.length;
  const root = categories.filter((category) => !category.parentId).length;
  const child = total - root;
  const withSlug = categories.filter((category) => Boolean(category.slug)).length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <Card><CardContent className="pt-6">{total}</CardContent></Card>
      <Card><CardContent className="pt-6 text-success">{root}</CardContent></Card>
      <Card><CardContent className="pt-6 text-warning">{child}</CardContent></Card>
      <Card><CardContent className="pt-6 text-primary">{withSlug}</CardContent></Card>
    </div>
  );
}

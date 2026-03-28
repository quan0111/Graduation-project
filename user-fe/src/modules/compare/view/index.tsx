// page.tsx
import { useCompare } from "@/hooks/useCompare";
import { CompareTable } from "@/components/compare/sections/CompareTable";
import { CompareSummary } from "@/components/compare/sections/CompareSummary";
import { EmptyCompare } from "@/components/compare/sections/EmptyCompare";

export default function Page() {
  const compare = useCompare(sampleProducts.slice(0,2));

  if (compare.list.length === 0) return <EmptyCompare/>;

  return (
    <div className="p-6">

      <CompareTable
        list={compare.list}
        allSpecs={compare.allSpecs}
        onRemove={compare.remove}
        onAdd={() => compare.add(sampleProducts)}
      />

      <CompareSummary list={compare.list}/>

    </div>
  );
}
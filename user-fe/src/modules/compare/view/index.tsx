// // app/compare/page.tsx (hoặc page.tsx nếu bạn dùng pages router)

// import { useCompare } from "../hook/useCompare";
// import { EmptyCompare } from "../components/emptyState";
// import { CompareTable } from "../components/Table";
// import { CompareSummary } from "../components/summary";
// import type { IProduct } from "../components/Table";

// // 👉 mock data (hoặc import từ API)
// import { sampleProducts } from "../data/sampleProducts";

// export default function Page() {
//   const compare = useCompare(sampleProducts.slice(0, 2));

//   if (!compare.list || compare.list.length === 0) {
//     return <EmptyCompare />;
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto">

//       {/* Compare Table */}
//       <CompareTable
//         list={compare.list}
//         allSpecs={compare.allSpecs}
//         onRemove={compare.remove}
//         onAdd={() => compare.add(sampleProducts)}
//       />

//       {/* Summary */}
//       <CompareSummary list={compare.list} />

//     </div>
//   );
// }
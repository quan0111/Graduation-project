import { Card, CardContent,  } from "@/components/ui/card";

export function AnalyticsStats() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <Card><CardContent className="pt-6">333M</CardContent></Card>
      <Card><CardContent className="pt-6">8,100</CardContent></Card>
      <Card><CardContent className="pt-6">410K</CardContent></Card>
      <Card><CardContent className="pt-6">28%</CardContent></Card>
    </div>
  );
}
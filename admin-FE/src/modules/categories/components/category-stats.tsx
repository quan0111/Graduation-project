import { Card, CardContent } from "@/components/ui/card";

export function CategoryStats() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <Card><CardContent className="pt-6">125</CardContent></Card>
      <Card><CardContent className="pt-6 text-success">120</CardContent></Card>
      <Card><CardContent className="pt-6 text-warning">5</CardContent></Card>
      <Card><CardContent className="pt-6 text-primary">12,000</CardContent></Card>
    </div>
  );
}
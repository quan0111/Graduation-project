// RelatedProducts.tsx
import { Card, CardContent } from "@/components/ui/card";

export const RelatedProducts = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <Card key={i}>
          <CardContent>Sản phẩm {i}</CardContent>
        </Card>
      ))}
    </div>
  );
};
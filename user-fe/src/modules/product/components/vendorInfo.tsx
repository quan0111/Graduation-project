// VendorInfo.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const VendorInfo = ({ product }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4 flex justify-between">
        <div>
          <p className="font-medium">{product.vendor}</p>
          <p className="text-sm text-muted">
            ⭐ {product.vendorRating}
          </p>
        </div>

        <Button variant="outline">Theo dõi</Button>
      </CardContent>
    </Card>
  );
};
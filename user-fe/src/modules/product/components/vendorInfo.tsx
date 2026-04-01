// VendorInfo.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IProduct } from "../types";

interface VendorInfoProps {
  product: IProduct;
}

export const VendorInfo: React.FC<VendorInfoProps> = ({ product }) => {
  const shop = product.Shop;

  return (
    <Card className="mb-6">
      <CardContent className="p-4 flex justify-between items-center">
        
        {/* Shop info */}
        <div className="flex items-center gap-3">
          
          {/* Avatar */}
          <img
            src={shop?.avatar_url || "/shop-placeholder.png"}
            alt={shop?.name}
            className="w-10 h-10 rounded-full object-cover"
          />

          {/* Name */}
          <div>
            <p className="font-medium">
              {shop?.name || "Unknown shop"}
            </p>

            <p className="text-sm text-muted-foreground">
              Shop chính hãng
            </p>
          </div>
        </div>

        {/* Follow */}
        <Button variant="outline">Theo dõi</Button>
      </CardContent>
    </Card>
  );
};
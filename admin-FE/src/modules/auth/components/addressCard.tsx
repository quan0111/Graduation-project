
import React from "react";
import { Button } from "@/components/ui/button";

type Address = {
  id: string;
  name: string;
  address: string;
};

type AddressCardProps = {
  addr: Address;
  onEdit?: (addr: Address) => void;
  onDelete?: (id: string) => void;
};

export const AddressCard: React.FC<AddressCardProps> = ({
  addr,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">{addr.name}</p>
          <p className="text-sm">{addr.address}</p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => onEdit?.(addr)}>
            Sửa
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete?.(addr.id)}
          >
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};
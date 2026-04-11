// tabs/AddressTab.tsx

import React from "react";
import { AddressCard } from "./addressCard";
import { Button } from "@/components/ui/button";

type Address = {
  id: string;
  name: string;
  address: string;
  isDefault?: boolean;
};

type AddressTabProps = {
  addresses: Address[];
  onAdd?: () => void;
  onEdit?: (addr: Address) => void;
  onDelete?: (id: string) => void;
};

export const AddressTab: React.FC<AddressTabProps> = ({
  addresses,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      <Button onClick={onAdd}>Thêm địa chỉ</Button>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted">Chưa có địa chỉ nào</p>
      ) : (
        addresses.map((addr: Address) => (
          <AddressCard
            key={addr.id}
            addr={addr}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};
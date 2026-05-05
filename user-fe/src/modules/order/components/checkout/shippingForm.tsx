import { toast } from "sonner";

interface Address {
  id: number;
  fullName: string;
  phone: string;
  addressLine: string;
}

interface Props {
  addresses: Address[];
  onNext: (data: Address) => void;
}

export const ShippingForm: React.FC<Props> = ({
  addresses,
  onNext,
}) => {
  const handleSelect = (addr: Address) => {
    onNext(addr);
  };

  if (!addresses.length) {
    return <p>Chưa có địa chỉ</p>;
  }

  return (
    <div className="space-y-3">
      {addresses.map((a) => (
        <div
          key={a.id}
          className="border p-4 rounded cursor-pointer hover:bg-muted"
          onClick={() => handleSelect(a)}
        >
          <p className="font-medium">{a.fullName}</p>
          <p className="text-sm">{a.phone}</p>
          <p className="text-sm">{a.addressLine}</p>
        </div>
      ))}
    </div>
  );
};
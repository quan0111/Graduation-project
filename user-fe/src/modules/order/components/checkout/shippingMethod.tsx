// ShippingMethod.tsx
export const ShippingMethod = ({ value, onChange, methods }) => {
  return (
    <div className="space-y-3">
      {methods.map(m => (
        <div
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`p-4 border rounded cursor-pointer
          ${value === m.id ? "border-primary bg-primary/5" : ""}`}
        >
          <p>{m.name}</p>
          <p className="text-sm text-muted">{m.time}</p>
        </div>
      ))}
    </div>
  );
};
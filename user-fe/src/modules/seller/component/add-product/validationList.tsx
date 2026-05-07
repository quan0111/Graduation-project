export function ValidationList({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return (
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Validate bước này đã đạt.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {errors.map((error) => (
        <p key={error}>- {error}</p>
      ))}
    </div>
  );
}
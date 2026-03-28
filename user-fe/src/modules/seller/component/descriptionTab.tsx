export function ProductDescriptionTab({
  description,
  setDescription,
}: any) {
  return (
    <textarea
      value={description}
      onChange={e => setDescription(e.target.value)}
      className="w-full h-48 border rounded-lg p-3"
    />
  );
}
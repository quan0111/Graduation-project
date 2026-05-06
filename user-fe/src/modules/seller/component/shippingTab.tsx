export function ProductShippingTab({
  enableShipping,
  setEnableShipping,
}: any) {
  return (
    <div>
      <label>Bật vận chuyển</label>

      <input
        type="checkbox"
        checked={enableShipping}
        onChange={e => setEnableShipping(e.target.checked)}
      />
    </div>
  );
}
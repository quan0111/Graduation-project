import { Card } from '@/components/ui/card';

export function ProductImages({ images, setImages }: any) {

  const handleUpload = (e: any) => {
    const files = Array.from(e.target.files);

    const urls = files.map((f: any) =>
      URL.createObjectURL(f)
    );

    setImages((prev: string[]) => [...prev, ...urls]);
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Hình ảnh sản phẩm</h3>

      <input type="file" multiple onChange={handleUpload} />

      <div className="grid grid-cols-3 gap-2 mt-4">
        {images.map((img: string, i: number) => (
          <img key={i} src={img} className="rounded" />
        ))}
      </div>

      {images.length < 3 && (
        <p className="text-red-500 text-sm mt-2">
          Cần ít nhất 3 ảnh
        </p>
      )}
    </Card>
  );
}

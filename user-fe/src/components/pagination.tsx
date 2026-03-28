import { Button } from '@/components/ui/button';

export function Pagination() {
  return (
    <div className="flex justify-center gap-2 mt-12">
      <Button variant="outline">Trước</Button>
      <Button>1</Button>
      <Button variant="outline">2</Button>
      <Button variant="outline">3</Button>
      <Button variant="outline">Tiếp</Button>
    </div>
  );
}
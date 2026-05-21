import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

export function DatabaseSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Database className="w-5 h-5" />
          Cơ sở dữ liệu
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4">
        <Button variant="outline">Sao lưu</Button>
        <Button variant="outline">Tối ưu</Button>
    
      </CardContent>
    </Card>
  );
}

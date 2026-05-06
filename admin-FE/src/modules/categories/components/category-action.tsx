import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

export function CategoryActions({ onEdit, onDelete, row }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(row)}>
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(row)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
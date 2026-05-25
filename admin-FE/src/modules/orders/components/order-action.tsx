'use client';

import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

type Props = {
  order: any;
  onView?: (order: any) => void;
  onDelete?: (order: any) => void;
  canCancel?: boolean;
};

export function OrderActions({ order, onView, onDelete, canCancel = false }: Props) {
  return (
    <div className="flex justify-center gap-2">
      
      {/* VIEW */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onView?.(order)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      {canCancel ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete?.(order)}
          title="Hủy đơn"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ) : null}
    </div>
  );
}

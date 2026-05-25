import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "default",
  isPending = false,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant === "destructive" ? "destructive" : "default"} onClick={onConfirm} disabled={isPending}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type NoticeDialogProps = {
  open: boolean;
  title?: string;
  description: string;
  closeLabel?: string;
  onOpenChange: (open: boolean) => void;
};

export function NoticeDialog({
  open,
  title = "Thông báo",
  description,
  closeLabel = "Đóng",
  onOpenChange,
}: NoticeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {closeLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type TextPromptDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  multiline?: boolean;
  isPending?: boolean;
  required?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: string) => void;
};

export function TextPromptDialog({
  open,
  title,
  description,
  label,
  placeholder,
  defaultValue = "",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  multiline = false,
  isPending = false,
  required = true,
  onOpenChange,
  onConfirm,
}: TextPromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [defaultValue, open]);

  const disabled = isPending || (required && !value.trim());
  const Field = multiline ? Textarea : Input;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-2">
          {label ? <label className="text-sm font-medium">{label}</label> : null}
          <Field
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            rows={multiline ? 4 : undefined}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={() => onConfirm(value.trim())} disabled={disabled}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

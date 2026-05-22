import { useEffect, useState, type FormEvent } from "react";

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
import { Label } from "@/components/ui/label";

import type { FlashSaleCreatePayload, FlashSaleStatus } from "../types";
import { getApiErrorMessage } from "../utils/error";

type FlashSaleFormState = {
  name: string;
  startsAt: string;
  endsAt: string;
  status: FlashSaleStatus;
};

type Props = {
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: FlashSaleCreatePayload) => Promise<void>;
};

const COPY = {
  title: "Tạo flash sale",
  description: "Thiết lập thời gian, trạng thái và sau đó thêm sản phẩm vào chương trình.",
  name: "Tên chương trình",
  startsAt: "Bắt đầu",
  endsAt: "Kết thúc",
  status: "Trạng thái",
  cancel: "Hủy",
  submit: "Tạo flash sale",
  submitting: "Đang tạo...",
  required: "Tên và thời gian flash sale là bắt buộc.",
  invalidDate: "Thời gian kết thúc phải sau thời gian bắt đầu.",
  failed: "Tạo flash sale thất bại.",
};

const STATUS_OPTIONS: Array<{ value: FlashSaleStatus; label: string }> = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ACTIVE", label: "Đang bật" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "ENDED", label: "Đã kết thúc" },
];

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const toDateTimeLocalValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const getInitialForm = (): FlashSaleFormState => {
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + 24 * 60 * 60 * 1000);

  return {
    name: "",
    startsAt: toDateTimeLocalValue(startsAt),
    endsAt: toDateTimeLocalValue(endsAt),
    status: "DRAFT",
  };
};

export function FlashSaleCreateDialog({ open, pending = false, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<FlashSaleFormState>(getInitialForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(getInitialForm());
      setError(null);
    }
  }, [open]);

  const updateField = (field: keyof FlashSaleFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    const startsAt = new Date(form.startsAt);
    const endsAt = new Date(form.endsAt);

    if (!name || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      setError(COPY.required);
      return;
    }

    if (endsAt <= startsAt) {
      setError(COPY.invalidDate);
      return;
    }

    try {
      await onSubmit({
        name,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        status: form.status,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, COPY.failed));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>{COPY.description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="flash-sale-name">{COPY.name}</Label>
            <Input
              id="flash-sale-name"
              value={form.name}
              onChange={(event) => updateField("name", event.currentTarget.value)}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="flash-sale-start">{COPY.startsAt}</Label>
              <Input
                id="flash-sale-start"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => updateField("startsAt", event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-end">{COPY.endsAt}</Label>
              <Input
                id="flash-sale-end"
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => updateField("endsAt", event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flash-sale-status">{COPY.status}</Label>
              <select
                id="flash-sale-status"
                className={selectClassName}
                value={form.status}
                onChange={(event) => updateField("status", event.currentTarget.value as FlashSaleStatus)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              {COPY.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? COPY.submitting : COPY.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

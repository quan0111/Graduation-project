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
  title: "T\u1ea1o flash sale",
  description: "Thi\u1ebft l\u1eadp th\u1eddi gian, tr\u1ea1ng th\u00e1i v\u00e0 sau \u0111\u00f3 th\u00eam s\u1ea3n ph\u1ea9m v\u00e0o ch\u01b0\u01a1ng tr\u00ecnh.",
  name: "T\u00ean ch\u01b0\u01a1ng tr\u00ecnh",
  startsAt: "B\u1eaft \u0111\u1ea7u",
  endsAt: "K\u1ebft th\u00fac",
  status: "Tr\u1ea1ng th\u00e1i",
  cancel: "H\u1ee7y",
  submit: "T\u1ea1o flash sale",
  submitting: "\u0110ang t\u1ea1o...",
  required: "T\u00ean v\u00e0 th\u1eddi gian flash sale l\u00e0 b\u1eaft bu\u1ed9c.",
  invalidDate: "Th\u1eddi gian k\u1ebft th\u00fac ph\u1ea3i sau th\u1eddi gian b\u1eaft \u0111\u1ea7u.",
  failed: "T\u1ea1o flash sale th\u1ea5t b\u1ea1i.",
};

const STATUS_OPTIONS: Array<{ value: FlashSaleStatus; label: string }> = [
  { value: "DRAFT", label: "B\u1ea3n nh\u00e1p" },
  { value: "ACTIVE", label: "\u0110ang b\u1eadt" },
  { value: "PAUSED", label: "T\u1ea1m d\u1eebng" },
  { value: "ENDED", label: "\u0110\u00e3 k\u1ebft th\u00fac" },
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

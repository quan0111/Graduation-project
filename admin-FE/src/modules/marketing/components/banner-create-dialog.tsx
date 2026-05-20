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
import { Textarea } from "@/components/ui/textarea";

import type { BannerCreatePayload, BannerPosition, BannerStatus } from "../types";
import { getApiErrorMessage } from "../utils/error";

type BannerFormState = {
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  redirectUrl: string;
  buttonText: string;
  position: BannerPosition;
  status: BannerStatus;
  priority: string;
  startAt: string;
  endAt: string;
};

type Props = {
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BannerCreatePayload) => Promise<void>;
};

const COPY = {
  title: "T\u1ea1o banner",
  description: "Nh\u1eadp th\u00f4ng tin banner hi\u1ec3n th\u1ecb tr\u00ean storefront.",
  name: "T\u00ean banner",
  subtitle: "M\u00f4 t\u1ea3",
  imageUrl: "URL \u1ea3nh desktop",
  mobileImageUrl: "URL \u1ea3nh mobile",
  redirectUrl: "URL \u0111i\u1ec1u h\u01b0\u1edbng",
  buttonText: "N\u00fat CTA",
  position: "V\u1ecb tr\u00ed",
  status: "Tr\u1ea1ng th\u00e1i",
  priority: "\u0110\u1ed9 \u01b0u ti\u00ean",
  startAt: "B\u1eaft \u0111\u1ea7u",
  endAt: "K\u1ebft th\u00fac",
  cancel: "H\u1ee7y",
  submit: "T\u1ea1o banner",
  submitting: "\u0110ang t\u1ea1o...",
  required: "T\u00ean banner v\u00e0 URL \u1ea3nh desktop l\u00e0 b\u1eaft bu\u1ed9c.",
  invalidPriority: "\u0110\u1ed9 \u01b0u ti\u00ean ph\u1ea3i l\u00e0 s\u1ed1 nguy\u00ean kh\u00f4ng \u00e2m.",
  invalidDate: "Th\u1eddi gian k\u1ebft th\u00fac ph\u1ea3i sau th\u1eddi gian b\u1eaft \u0111\u1ea7u.",
  failed: "T\u1ea1o banner th\u1ea5t b\u1ea1i.",
};

const INITIAL_FORM: BannerFormState = {
  title: "",
  subtitle: "",
  imageUrl: "",
  mobileImageUrl: "",
  redirectUrl: "",
  buttonText: "",
  position: "HOME_TOP",
  status: "DRAFT",
  priority: "0",
  startAt: "",
  endAt: "",
};

const POSITION_OPTIONS: Array<{ value: BannerPosition; label: string }> = [
  { value: "HOME_TOP", label: "Home top" },
  { value: "HOME_MIDDLE", label: "Home middle" },
  { value: "HOME_BOTTOM", label: "Home bottom" },
  { value: "CATEGORY_TOP", label: "Category top" },
  { value: "PRODUCT_DETAIL", label: "Product detail" },
];

const STATUS_OPTIONS: Array<{ value: BannerStatus; label: string }> = [
  { value: "DRAFT", label: "B\u1ea3n nh\u00e1p" },
  { value: "ACTIVE", label: "\u0110ang b\u1eadt" },
  { value: "PAUSED", label: "T\u1ea1m d\u1eebng" },
  { value: "ENDED", label: "\u0110\u00e3 k\u1ebft th\u00fac" },
];

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const optionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const toOptionalDate = (value: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function BannerCreateDialog({ open, pending = false, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<BannerFormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({ ...INITIAL_FORM });
      setError(null);
    }
  }, [open]);

  const updateField = (field: keyof BannerFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const title = form.title.trim();
    const imageUrl = form.imageUrl.trim();

    if (!title || !imageUrl) {
      setError(COPY.required);
      return;
    }

    const priority = Number(form.priority || 0);
    if (!Number.isInteger(priority) || priority < 0) {
      setError(COPY.invalidPriority);
      return;
    }

    const startDate = toOptionalDate(form.startAt);
    const endDate = toOptionalDate(form.endAt);
    if (startDate && endDate && endDate <= startDate) {
      setError(COPY.invalidDate);
      return;
    }

    try {
      await onSubmit({
        title,
        subtitle: optionalValue(form.subtitle),
        imageUrl,
        mobileImageUrl: optionalValue(form.mobileImageUrl),
        redirectUrl: optionalValue(form.redirectUrl),
        buttonText: optionalValue(form.buttonText),
        position: form.position,
        status: form.status,
        priority,
        startAt: startDate?.toISOString() ?? null,
        endAt: endDate?.toISOString() ?? null,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, COPY.failed));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>{COPY.description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-title">{COPY.name}</Label>
              <Input
                id="banner-title"
                value={form.title}
                onChange={(event) => updateField("title", event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-image">{COPY.imageUrl}</Label>
              <Input
                id="banner-image"
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.currentTarget.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-subtitle">{COPY.subtitle}</Label>
            <Textarea
              id="banner-subtitle"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.currentTarget.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-mobile-image">{COPY.mobileImageUrl}</Label>
              <Input
                id="banner-mobile-image"
                value={form.mobileImageUrl}
                onChange={(event) => updateField("mobileImageUrl", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-redirect">{COPY.redirectUrl}</Label>
              <Input
                id="banner-redirect"
                value={form.redirectUrl}
                onChange={(event) => updateField("redirectUrl", event.currentTarget.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="banner-button">{COPY.buttonText}</Label>
              <Input
                id="banner-button"
                value={form.buttonText}
                onChange={(event) => updateField("buttonText", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-position">{COPY.position}</Label>
              <select
                id="banner-position"
                className={selectClassName}
                value={form.position}
                onChange={(event) => updateField("position", event.currentTarget.value as BannerPosition)}
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-status">{COPY.status}</Label>
              <select
                id="banner-status"
                className={selectClassName}
                value={form.status}
                onChange={(event) => updateField("status", event.currentTarget.value as BannerStatus)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="banner-priority">{COPY.priority}</Label>
              <Input
                id="banner-priority"
                min={0}
                step={1}
                type="number"
                value={form.priority}
                onChange={(event) => updateField("priority", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-start">{COPY.startAt}</Label>
              <Input
                id="banner-start"
                type="datetime-local"
                value={form.startAt}
                onChange={(event) => updateField("startAt", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-end">{COPY.endAt}</Label>
              <Input
                id="banner-end"
                type="datetime-local"
                value={form.endAt}
                onChange={(event) => updateField("endAt", event.currentTarget.value)}
              />
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

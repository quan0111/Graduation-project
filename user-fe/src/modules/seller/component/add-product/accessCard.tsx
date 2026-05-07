import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function AccessCard({
  icon,
  title,
  description,
  primaryLabel,
  primaryHref,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
}) {
  return (
    <div className="rounded-[32px] border bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
        {icon}
      </div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{description}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to={primaryHref}>
          <Button>{primaryLabel}</Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
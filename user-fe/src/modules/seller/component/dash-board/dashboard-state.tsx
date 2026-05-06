import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SellerDashboardStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export function DashboardState({
  title,
  description,
  actionLabel,
  actionHref,
}: SellerDashboardStateProps) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        <Link to={actionHref}>
          <Button className="bg-[#ee4d2d] hover:bg-[#d93f21]">{actionLabel}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useMe } from "@/modules/auth/api/get-auth-me";

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#ee4d2d]" />
        <p className="text-sm font-medium text-slate-700">Đang kiểm tra quyền truy cập...</p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (isError || !data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireSeller({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (isError || !data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (String(data.role).toUpperCase() !== "SELLER") {
    return <Navigate to="/seller" replace state={{ reason: "seller_required" }} />;
  }

  return <>{children}</>;
}

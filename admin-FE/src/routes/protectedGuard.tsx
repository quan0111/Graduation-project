import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getAdminAccessToken } from "@/lib/auth-storage";
import { useMe } from "@/modules/auth/api/get-auth-me";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAdminAccessToken();
  const { data: user, isLoading, isError } = useMe({ config: { enabled: Boolean(token) } });

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Đang kiểm tra quyền admin...</div>;
  }

  if (isError || !user || user.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

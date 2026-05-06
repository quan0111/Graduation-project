import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getAdminAccessToken, getStoredAdminUser } from "@/lib/auth-storage";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAdminAccessToken();
  const user = getStoredAdminUser<{ role?: string }>();

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

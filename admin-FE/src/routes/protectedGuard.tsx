import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  let parsedUser;

  try {
    parsedUser = JSON.parse(user);
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  if (parsedUser?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
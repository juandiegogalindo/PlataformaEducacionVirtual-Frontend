import { Navigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
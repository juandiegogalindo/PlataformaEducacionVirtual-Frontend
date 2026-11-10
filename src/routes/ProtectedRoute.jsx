import { Navigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, accessToken, initialized } = useAuthStore();

  if (!initialized) return <p role="status">Verificando sesión...</p>;
  if (!accessToken) return <Navigate to="/login" replace />;
  if (!user) return <Navigate to="/login" replace />;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : allowedRoles ? [allowedRoles] : [];
  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/cursos" replace />;
  }
  return children;
}
import { Outlet, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuthStore } from "../../auth/authStore";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";

function iniciales(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export default function Layout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary text-white grid place-items-center">
            <GraduationCap size={16} />
          </span>
          <span className="font-semibold text-sm">Aularia</span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-semibold grid place-items-center">
                {iniciales(user.nombre)}
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold">{user.nombre}</p>
                <p className="text-[11px] text-slate-500 capitalize">{user.rol}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
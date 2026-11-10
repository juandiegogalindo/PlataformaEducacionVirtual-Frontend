import { Outlet, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuthStore } from "../../auth/authStore";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";
import Avatar from "../Avatar";

export default function Layout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="h-dvh flex flex-col">
      <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 sm:px-6">

        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary text-white grid place-items-center">
            <GraduationCap size={16} />
          </span>
          <span className="font-semibold text-sm">Aularia</span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <Avatar usuario={user} tamano={32} />

              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-semibold">
                  {user.nombre}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {user.rol}
                </p>
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

      <div className="flex flex-col sm:flex-row flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-8">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

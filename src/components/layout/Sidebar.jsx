import { Link, useLocation, useMatch } from "react-router-dom";
import {
  BookOpen,
  LayoutGrid,
  MessageSquare,
  ClipboardList,
  User,
  Users,
  Award
} from "lucide-react";

import { useAuthStore } from "../../auth/authStore";
import { ROLES, ROLES_EVALUACIONES } from "../../auth/roles";

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const esEstudiante = user?.rol === ROLES.ESTUDIANTE;
  const enEvaluaciones = Boolean(useMatch("/cursos/:cursoId/evaluaciones/*"));
  const enCalificaciones = Boolean(useMatch("/cursos/:cursoId/calificaciones"));
  const { pathname } = useLocation();

  const links = [
    user?.rol === ROLES.ADMINISTRADOR && {
      to: "/admin/usuarios",
      label: "Usuarios",
      icon: Users
    },
    esEstudiante && {
      to: "/inscripciones",
      label: "Mis cursos",
      icon: BookOpen
    },
    {
      to: "/cursos",
      label: esEstudiante ? "Catálogo de cursos" : "Cursos",
      icon: LayoutGrid
    },
    ROLES_EVALUACIONES.includes(user?.rol) && {
      to: "/evaluaciones",
      label: "Evaluaciones",
      icon: ClipboardList
    },
    [ROLES.ESTUDIANTE, ROLES.DOCENTE].includes(user?.rol) && {
      to: "/calificaciones",
      label: "Calificaciones",
      icon: Award
    },
    {
      to: "/foro",
      label: "Foro",
      icon: MessageSquare
    },
    {
      to: "/perfil",
      label: "Perfil",
      icon: User
    }
  ].filter(Boolean);

  return (
    <aside className="w-full sm:w-56 shrink-0 bg-sidebar text-slate-300 py-2 sm:py-5">
      <p className="hidden sm:block px-5 mb-3 text-[10px] tracking-widest text-slate-500">
        MENÚ
      </p>

      <nav className="flex sm:flex-col gap-1 px-3 overflow-x-auto" aria-label="Menú principal">
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = to === "/evaluaciones"
            ? pathname === to || enEvaluaciones
            : to === "/calificaciones" ? pathname === to || enCalificaciones
            : (pathname === to || pathname.startsWith(`${to}/`)) && !(to === "/cursos" && (enEvaluaciones || enCalificaciones));
          return <Link
            key={to}
            to={to}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 px-3 py-2 rounded-md text-sm whitespace-nowrap border-l-2 transition-colors ${
                isActive
                  ? "bg-sidebar-hover text-white border-primary"
                  : "border-transparent hover:bg-sidebar-hover hover:text-white"
              }`}
          >
            <Icon size={16} />
            {label}
          </Link>;
        })}
      </nav>
    </aside>
  );
}

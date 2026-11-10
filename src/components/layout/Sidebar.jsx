import { NavLink } from "react-router-dom";
import { BookOpen, LayoutGrid, MessageSquare, ClipboardList, User } from "lucide-react";
import { useAuthStore } from "../../auth/authStore";
import { ROLES } from "../../auth/roles";

const links = [
  { to: "/cursos", label: "Cursos" },
  { to: "/inscripciones", label: "Mis inscripciones", roles: [ROLES.ESTUDIANTE] },
  { to: "/foro", label: "Foro" },
  { to: "/evaluaciones", label: "Evaluaciones" },
  { to: "/perfil", label: "Perfil" },
];


export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const esEstudiante = user?.rol === ROLES.ESTUDIANTE;

  const links = [
    esEstudiante && { to: "/inscripciones", label: "Mis cursos", icon: BookOpen },
    { to: "/cursos", label: esEstudiante ? "Catálogo de cursos" : "Cursos", icon: LayoutGrid },
    { to: "/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
    { to: "/foro", label: "Foro", icon: MessageSquare },
    { to: "/perfil", label: "Perfil", icon: User },
  ].filter(Boolean);

  return (
    <aside className="w-56 shrink-0 bg-sidebar text-slate-300 py-5">
      <p className="px-5 mb-3 text-[10px] tracking-widest text-slate-500">MENÚ</p>

      <nav className="flex flex-col gap-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm border-l-2 transition-colors ${
                isActive
                  ? "bg-sidebar-hover text-white border-primary"
                  : "border-transparent hover:bg-sidebar-hover hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
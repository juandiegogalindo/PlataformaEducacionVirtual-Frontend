import { Link, useNavigate } from "react-router-dom";
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
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const linksVisibles = links.filter((link) => !link.roles || link.roles.includes(user?.rol));

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="w-56 h-screen bg-black text-white flex flex-col p-4 gap-2">
      <h1 className="text-lg font-bold mb-4">Bit Criollo</h1>

      {linksVisibles.map((link) => (
        <Link key={link.to} to={link.to} className="py-2 px-3 rounded hover:bg-gray-800">
          {link.label}
        </Link>
      ))}

      <div className="mt-auto flex flex-col gap-2">
        {user && <p className="text-sm text-gray-400 px-3">{user.nombre} ({user.rol})</p>}
        <button onClick={handleLogout} className="py-2 px-3 rounded hover:bg-gray-800 text-left text-red-400">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
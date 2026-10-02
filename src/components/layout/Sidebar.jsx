import { Link } from "react-router-dom";

const links = [
  { to: "/cursos", label: "Cursos" },
  { to: "/foro", label: "Foro" },
  { to: "/evaluaciones", label: "Evaluaciones" },
  { to: "/perfil", label: "Perfil" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-black text-white flex flex-col p-4 gap-2">
      <h1 className="text-lg font-bold mb-4">Bit Criollo</h1>
      {links.map((link) => (
        <Link key={link.to} to={link.to} className="py-2 px-3 rounded hover:bg-gray-800">
          {link.label}
        </Link>
      ))}
    </aside>
  );
}
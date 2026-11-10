import { useLocation, Link } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="text-xs text-slate-400 mb-4 flex flex-wrap gap-1">
      <Link to="/" className="hover:underline">Inicio</Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        const esUltimo = i === parts.length - 1;
        return (
          <span key={path} className="flex gap-1 capitalize">
            <span>/</span>
            {esUltimo ? (
              <span className="font-semibold text-slate-700">{part}</span>
            ) : (
              <Link to={path} className="hover:underline">{part}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
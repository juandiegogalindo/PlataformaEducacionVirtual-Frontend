import { useLocation, Link } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-500 mb-4">
      <Link to="/" className="hover:underline">Inicio</Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        return (
          <span key={path}>
            {" / "}
            <Link to={path} className="hover:underline capitalize">{part}</Link>
          </span>
        );
      })}
    </nav>
  );
}
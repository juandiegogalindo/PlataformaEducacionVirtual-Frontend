import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarCursosRequest } from "../../api/cursos";

const estadoColor = {
  ACTIVO: "bg-green-900 text-green-300",
  ARCHIVADO: "bg-gray-700 text-gray-400",
};

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  listarCursosRequest()
    .then((res) => {
      const activos = res.data.filter((curso) => curso.estado === "ACTIVO");
      setCursos(activos);
    })
    .catch(() => setError("No se pudieron cargar los cursos"))
    .finally(() => setLoading(false));
}, []);

  if (loading) return <p className="text-gray-400">Cargando cursos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catálogo de Cursos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso) => (
          <Link
            key={curso.id}
            to={`/cursos/${curso.id}`}
            className="border border-gray-700 rounded p-4 hover:bg-gray-900 transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-semibold">{curso.nombre}</h2>
              <span className={`text-xs px-2 py-1 rounded ${estadoColor[curso.estado]}`}>
                {curso.estado}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{curso.descripcion}</p>
            <p className="text-sm">Docente: {curso.docenteNombre}</p>
            <p className="text-xs text-gray-500 mt-1">
              {curso.fechaInicio} – {curso.fechaFin} · Cupo: {curso.cupoMaximo}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
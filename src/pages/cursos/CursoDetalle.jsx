import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { verCursoRequest } from "../../api/cursos";

export default function CursoDetalle() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    verCursoRequest(id)
      .then((res) => setCurso(res.data))
      .catch(() => setError("No se pudo cargar el curso"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-400">Cargando curso...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <Link to="/cursos" className="text-sm text-gray-400 hover:underline">
        &larr; Volver al catálogo
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">{curso.nombre}</h1>
      <p className="text-gray-400 mb-4">{curso.descripcion}</p>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p><span className="text-gray-500">Docente:</span> {curso.docenteNombre} ({curso.docenteCorreo})</p>
        <p><span className="text-gray-500">Creado por:</span> {curso.creadoPorNombre}</p>
        <p><span className="text-gray-500">Fecha inicio:</span> {curso.fechaInicio}</p>
        <p><span className="text-gray-500">Fecha fin:</span> {curso.fechaFin}</p>
        <p><span className="text-gray-500">Cupo máximo:</span> {curso.cupoMaximo}</p>
        <p><span className="text-gray-500">Estado:</span> {curso.estado}</p>
      </div>
    </div>
  );
}
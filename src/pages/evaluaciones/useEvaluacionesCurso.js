import { useEffect, useState } from "react";
import { verCursoRequest } from "../../api/cursos";
import { listarEvaluacionesRequest } from "../../api/evaluaciones";
import { mensajeError } from "../../utils/errores";

export default function useEvaluacionesCurso(cursoId) {
  const [datos, setDatos] = useState({ curso: null, evaluaciones: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let vigente = true;
    Promise.all([verCursoRequest(cursoId), listarEvaluacionesRequest(cursoId)])
      .then(([curso, evaluaciones]) => {
        if (vigente) setDatos({ curso: curso.data, evaluaciones: evaluaciones.data, loading: false, error: "" });
      })
      .catch((err) => {
        if (vigente) setDatos({ curso: null, evaluaciones: [], loading: false, error: mensajeError(err, "No se pudieron cargar las evaluaciones.") });
      });
    return () => { vigente = false; };
  }, [cursoId, revision]);

  function recargar() {
    setDatos((actuales) => ({ ...actuales, loading: true, error: "" }));
    setRevision((actual) => actual + 1);
  }

  return { ...datos, recargar };
}

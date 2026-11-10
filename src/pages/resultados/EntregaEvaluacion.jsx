import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { misCalificacionesRequest, registrarResultadoRequest } from "../../api/resultados";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import { Textarea } from "../../components/ui/Input";
import DetalleResultado, { EstadoResultado } from "./DetalleResultado";
import { restriccionEntrega, resultadosEvaluacion, validarContenido } from "../../utils/resultadoUtils";

export default function EntregaEvaluacion({ evaluacion, tipo, onGuardando }) {
  const [datos, setDatos] = useState({ resultados: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [contenido, setContenido] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const enviando = useRef(false);

  useEffect(() => {
    let vigente = true;
    misCalificacionesRequest().then(({ data }) => {
      if (vigente) setDatos({ resultados: resultadosEvaluacion(data, evaluacion.id, evaluacion.cursoId), loading: false, error: "" });
    }).catch((err) => {
      if (vigente) setDatos({ resultados: [], loading: false, error: mensajeError(err, "No se pudieron cargar tus entregas.") });
    });
    return () => { vigente = false; };
  }, [evaluacion.id, evaluacion.cursoId, revision]);

  function recargar() {
    setDatos((actual) => ({ ...actual, loading: true, error: "" }));
    setRevision((n) => n + 1);
  }

  const restriccion = restriccionEntrega(evaluacion, tipo, datos.resultados);
  async function entregar(event) {
    event.preventDefault();
    if (enviando.current || datos.loading || datos.error || restriccion) return;
    const problema = validarContenido(contenido, tipo);
    if (problema) { setError(problema); return; }
    if (!window.confirm(tipo === "tareas" ? "¿Confirmar la entrega? Solo se permite una entrega por tarea." : "¿Registrar este intento de examen? Consumirá uno de tus intentos permitidos.")) return;
    enviando.current = true;
    setGuardando(true);
    onGuardando(true);
    setError("");
    setAviso("");
    try {
      const { data } = await registrarResultadoRequest(evaluacion.id, contenido.trim());
      setDatos((actual) => ({ ...actual, resultados: [data, ...actual.resultados] }));
      setContenido("");
      setAviso(tipo === "tareas" ? "Tu entrega se registró correctamente." : `Se registró el intento ${data.numeroIntento} del examen.`);
    } catch (err) {
      setError(mensajeError(err, "No se pudo registrar la entrega o el intento."));
    } finally {
      enviando.current = false;
      setGuardando(false);
      onGuardando(false);
    }
  }

  return <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-label="Tus entregas">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold">{tipo === "tareas" ? "Tu entrega" : "Tus intentos"}</h2><button onClick={recargar} disabled={guardando || datos.loading} className="text-xs font-semibold text-primary disabled:opacity-50">Actualizar entregas</button></div>
    {datos.loading ? <p className="text-xs text-slate-400" role="status">Consultando tus entregas...</p> : datos.error ? <Alert variant="error" title={datos.error} /> : <>
      {aviso && <Alert variant="success" title={aviso} className="mb-4" />}
      {error && <Alert variant="error" title={error} className="mb-4" />}
      {tipo === "examenes" && <p className="mb-4 text-xs text-slate-500">Intentos registrados: {datos.resultados.length} de {evaluacion.numeroIntentosPermitidos}.</p>}
      {restriccion ? <Alert variant="warning" title={restriccion} className="mb-4" /> : <form onSubmit={entregar} className="mb-5 space-y-4" aria-label="Registrar entrega">
        <Textarea label={tipo === "tareas" ? "Contenido de la entrega" : "Respuesta o comentarios (opcional)"} name="contenido" rows={6} value={contenido} onChange={(event) => setContenido(event.target.value)} required={tipo === "tareas"} disabled={guardando} />
        <button type="submit" disabled={guardando} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{guardando ? "Registrando..." : tipo === "tareas" ? "Confirmar entrega" : "Registrar intento"}</button>
      </form>}
      {datos.resultados.length > 0 && <div className="space-y-3">{datos.resultados.map((resultado) => <details key={resultado.id} className="rounded-lg border border-slate-200 p-4">
        <summary className="cursor-pointer text-xs font-semibold">Intento {resultado.numeroIntento} <EstadoResultado resultado={resultado} /></summary>
        <div className="mt-4"><DetalleResultado resultado={resultado} /></div>
      </details>)}</div>}
      <Link to={`/calificaciones?curso=${evaluacion.cursoId}`} className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">Ver mis calificaciones</Link>
    </>}
  </section>;
}

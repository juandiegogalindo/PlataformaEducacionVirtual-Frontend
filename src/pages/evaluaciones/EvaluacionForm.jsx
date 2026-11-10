import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Info } from "lucide-react";
import { crearEvaluacionRequest } from "../../api/evaluaciones";
import { useAuthStore } from "../../auth/authStore";
import { esDocenteDelCurso } from "../../auth/roles";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Input, { Select, Textarea } from "../../components/ui/Input";
import useEvaluacionesCurso from "../../utils/useEvaluacionesCurso";
import { porcentaje, pesoTotal, prepararEvaluacion, rutaEvaluacion, validarEvaluacion } from "../../utils/evaluacionUtils";

const inicial = {
  titulo: "", descripcion: "", pesoPorcentual: "", instrucciones: "", fechaLimite: "",
  permiteEntregaTardia: false, penalizacionTardanzaPorcentaje: "0",
  fechaAplicacion: "", tiempoLimite: "60", numeroIntentosPermitidos: "1", aleatorio: false,
};

export default function EvaluacionForm() {
  const { cursoId } = useParams();
  return <Formulario key={cursoId} cursoId={cursoId} />;
}

function Formulario({ cursoId }) {
  const user = useAuthStore((state) => state.user);
  const { curso, evaluaciones, loading, error: errorCarga, recargar } = useEvaluacionesCurso(cursoId);
  const [tipo, setTipo] = useState("TAREA");
  const [form, setForm] = useState(inicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);
  const alerta = useRef(null);
  const navigate = useNavigate();
  const lista = `/cursos/${cursoId}/evaluaciones`;
  const pesoActual = pesoTotal(evaluaciones);
  const disponible = Math.max(0, 100 - pesoActual);

  function cambiar(event) {
    const { name, value, type, checked } = event.target;
    setForm((actual) => ({ ...actual, [name]: type === "checkbox" ? checked : value }));
  }

  function mostrarError(texto) {
    setError(texto);
    alerta.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    alerta.current?.focus();
  }

  async function crear(event) {
    event.preventDefault();
    if (enviando.current || !esDocenteDelCurso(user, curso)) return;
    const problema = validarEvaluacion(form, tipo, pesoActual);
    if (problema) { mostrarError(problema); return; }
    enviando.current = true;
    setGuardando(true);
    setError("");
    try {
      const { data } = await crearEvaluacionRequest(cursoId, tipo, prepararEvaluacion(form, tipo));
      navigate(rutaEvaluacion(cursoId, tipo, data.id), { replace: true, state: { mensaje: "Evaluación creada como borrador. Publícala cuando esté lista para los estudiantes." } });
    } catch (err) {
      mostrarError(mensajeError(err, "No se pudo crear la evaluación."));
    } finally {
      enviando.current = false;
      setGuardando(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-400" role="status">Cargando configuración del curso...</p>;
  if (errorCarga) return <div><Alert variant="error" title={errorCarga} /><button onClick={recargar} className="mt-3 text-xs font-semibold text-primary">Reintentar</button></div>;
  if (!esDocenteDelCurso(user, curso)) return <Alert variant="error" title="Solo el docente del curso puede crear evaluaciones." />;

  return (
    <div>
      <Link to={lista} className="text-xs text-slate-500 hover:underline">← Volver a evaluaciones</Link>
      <h1 className="mt-4 text-xl font-semibold">Crear evaluación</h1>
      <p className="mb-6 text-xs text-slate-500">{curso.nombre}</p>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
        <form onSubmit={crear} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-label="Crear evaluación">
          <div ref={alerta} tabIndex={-1} className="outline-none">{error && <Alert variant="error" title={error} className="mb-5" />}</div>
          <fieldset disabled={guardando || disponible <= 1e-9} className="min-w-0">
            <legend className="mb-5 text-sm font-semibold">Configuración</legend>
            <div className="mb-5 flex gap-1 rounded-md bg-slate-100 p-1" role="group" aria-label="Tipo de evaluación">
              {[{ value: "TAREA", label: "Tarea" }, { value: "EXAMEN", label: "Examen" }].map((opcion) => (
                <button key={opcion.value} type="button" aria-pressed={tipo === opcion.value} onClick={() => { setTipo(opcion.value); setError(""); }} className={`flex-1 rounded px-4 py-2 text-xs font-semibold disabled:opacity-50 ${tipo === opcion.value ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>{opcion.label}</button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Curso asociado" aria-label="Curso asociado" value={curso.id} disabled><option value={curso.id}>{curso.nombre}</option></Select>
              <Input label="Peso de la evaluación (%)" name="pesoPorcentual" type="number" min="0" max="100" step="any" required value={form.pesoPorcentual} onChange={cambiar} />
              <Input label="Título de la evaluación" name="titulo" required value={form.titulo} onChange={cambiar} className="sm:col-span-2" />
              <Textarea label="Descripción" name="descripcion" rows={3} value={form.descripcion} onChange={cambiar} className="sm:col-span-2" />
              {tipo === "TAREA" ? <>
                <Textarea label="Instrucciones" name="instrucciones" rows={4} value={form.instrucciones} onChange={cambiar} className="sm:col-span-2" />
                <Input label="Fecha y hora límite" name="fechaLimite" type="datetime-local" required value={form.fechaLimite} onChange={cambiar} />
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="permiteEntregaTardia" checked={form.permiteEntregaTardia} onChange={cambiar} className="accent-primary" /> Permitir entrega tardía</label>
                </div>
                {form.permiteEntregaTardia && <Input label="Penalización por tardanza (%)" name="penalizacionTardanzaPorcentaje" type="number" min="0" max="100" step="any" value={form.penalizacionTardanzaPorcentaje} onChange={cambiar} required />}
              </> : <>
                <Input label="Fecha y hora de aplicación" name="fechaAplicacion" type="datetime-local" required value={form.fechaAplicacion} onChange={cambiar} className="sm:col-span-2" />
                <Input label="Duración (minutos)" name="tiempoLimite" type="number" min="1" step="1" required value={form.tiempoLimite} onChange={cambiar} />
                <Input label="Intentos permitidos" name="numeroIntentosPermitidos" type="number" min="1" step="1" required value={form.numeroIntentosPermitidos} onChange={cambiar} />
                <label className="flex items-center gap-2 text-xs sm:col-span-2"><input type="checkbox" name="aleatorio" checked={form.aleatorio} onChange={cambiar} className="accent-primary" /> Configuración aleatoria</label>
              </>}
            </div>
          </fieldset>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            {!guardando && <Link to={lista} className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50">Cancelar</Link>}
            <button type="submit" disabled={guardando || disponible <= 1e-9} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">{guardando ? "Creando..." : "Crear evaluación"}</button>
          </div>
        </form>
        <aside className="space-y-4">
          <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-700"><Info size={16} className="shrink-0" /><p>La evaluación se creará como borrador. Después podrás publicarla para que sea visible para los estudiantes inscritos.</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs"><h2 className="mb-3 font-semibold">Peso del curso</h2><p className="text-slate-500">Asignado: {porcentaje(pesoActual)} %</p><p className="mt-1 font-semibold">Disponible: {porcentaje(disponible)} %</p></div>
          {disponible <= 1e-9 && <Alert variant="warning" title="Ya se asignó el 100 % del peso del curso." />}
        </aside>
      </div>
    </div>
  );
}

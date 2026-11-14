import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { listarCursosGestionRequest } from "../../api/cursos";
import { consultarReporteAcademicoRequest, exportarReporteAcademicoRequest } from "../../api/reportes";
import { useAuthStore } from "../../auth/authStore";
import { ROLES } from "../../auth/roles";
import Alert from "../../components/ui/Alert";
import Input, { Select } from "../../components/ui/Input";
import { mensajeError } from "../../utils/errores";
import {
  nombreArchivoRespuesta,
  prepararFiltrosReporte,
  resultadosReporte,
  validarFiltrosReporte,
} from "../../utils/reportes";

function guardarArchivo(response, nombrePorDefecto) {
  const url = URL.createObjectURL(response.data);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivoRespuesta(response.headers, nombrePorDefecto);
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export default function ReportesAcademicos() {
  const user = useAuthStore((state) => state.user);
  const [formulario, setFormulario] = useState({ tipoReporte: "MATRICULAS", periodo: "", programa: "", cursoId: "" });
  const [cursos, setCursos] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exportando, setExportando] = useState("");

  useEffect(() => {
    if (user?.rol !== ROLES.COORDINADOR) return undefined;
    let vigente = true;
    listarCursosGestionRequest().then(({ data }) => {
      if (vigente) setCursos(Array.isArray(data) ? data : []);
    }).catch(() => {
      // El filtro de curso es opcional; la consulta sigue disponible aunque no cargue el catálogo.
    });
    return () => { vigente = false; };
  }, [user?.rol]);

  if (user?.rol !== ROLES.COORDINADOR) {
    return <Alert variant="error" title="Acceso no autorizado">Solo el Coordinador Académico puede consultar reportes.</Alert>;
  }

  function cambiarCampo(event) {
    setFormulario((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  }

  async function consultar(event) {
    event.preventDefault();
    const problema = validarFiltrosReporte(formulario);
    if (problema) {
      setError(problema);
      setReporte(null);
      return;
    }
    setCargando(true);
    setError("");
    setAviso("");
    try {
      const { data } = await consultarReporteAcademicoRequest(prepararFiltrosReporte(formulario));
      setReporte(data);
    } catch (err) {
      setReporte(null);
      setError(mensajeError(err, "No se pudo consultar el reporte académico."));
    } finally {
      setCargando(false);
    }
  }

  async function exportar(formato) {
    const problema = validarFiltrosReporte(formulario);
    if (problema) {
      setError(problema);
      return;
    }
    setExportando(formato);
    setError("");
    setAviso("");
    try {
      const extension = formato === "pdf" ? "pdf" : "xlsx";
      const { data, headers } = await exportarReporteAcademicoRequest(formato, prepararFiltrosReporte(formulario));
      guardarArchivo({ data, headers }, `reporte-academico-matriculas-${formulario.periodo.trim()}.${extension}`);
      setAviso(`Reporte ${formato.toUpperCase()} descargado correctamente.`);
    } catch (err) {
      setError(mensajeError(err, `No se pudo exportar el reporte en ${formato.toUpperCase()}.`));
    } finally {
      setExportando("");
    }
  }

  const resultados = resultadosReporte(reporte);
  return <div>
    <div className="mb-6">
      <h1 className="text-xl font-semibold">Reportes académicos</h1>
      <p className="text-xs text-slate-500">Consulta las matrículas por período y descarga el reporte.</p>
    </div>

    {error && <Alert variant="error" title="No se pudo completar la operación" className="mb-4">{error}</Alert>}
    {aviso && <Alert variant="success" title={aviso} className="mb-4" />}

    <form onSubmit={consultar} className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-label="Filtros del reporte">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Tipo de reporte" name="tipoReporte" value={formulario.tipoReporte} onChange={cambiarCampo} required disabled={cargando || Boolean(exportando)}>
          <option value="MATRICULAS">Matrículas</option>
        </Select>
        <Input label="Período académico" name="periodo" placeholder="YYYY-1 o YYYY-2" value={formulario.periodo} onChange={cambiarCampo} required disabled={cargando || Boolean(exportando)} />
        <Input label="Programa (opcional)" name="programa" placeholder="Ej. ingeniería de sistemas" value={formulario.programa} onChange={cambiarCampo} disabled={cargando || Boolean(exportando)} />
        <Select label="Curso (opcional)" name="cursoId" value={formulario.cursoId} onChange={cambiarCampo} disabled={cargando || Boolean(exportando)}>
          <option value="">Todos los cursos</option>
          {cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.nombre}</option>)}
        </Select>
      </div>
      <button type="submit" disabled={cargando || Boolean(exportando)} className="mt-4 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
        {cargando ? "Consultando..." : "Consultar reporte"}
      </button>
    </form>

    {reporte && <section aria-label="Resultados del reporte">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-sm font-semibold">Resultados</h2><p className="text-xs text-slate-500">{reporte.totalRegistros ?? resultados.length} registros encontrados</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => exportar("pdf")} disabled={Boolean(exportando)} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"><FileText size={14} />{exportando === "pdf" ? "Descargando..." : "PDF"}</button>
          <button type="button" onClick={() => exportar("excel")} disabled={Boolean(exportando)} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"><FileSpreadsheet size={14} />{exportando === "excel" ? "Descargando..." : "Excel"}</button>
        </div>
      </div>
      {resultados.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500"><Download className="mx-auto mb-2 text-slate-400" size={20} />No hay datos para los filtros seleccionados.</div> : <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Estudiante</th><th className="px-4 py-3">Programa</th><th className="px-4 py-3">Curso</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Calificación</th></tr></thead><tbody className="divide-y divide-slate-100">{resultados.map((resultado) => <tr key={resultado.inscripcionId}><td className="px-4 py-3"><strong>{resultado.nombreCompleto}</strong><span className="block text-slate-500">{resultado.correo}</span></td><td className="px-4 py-3">{resultado.programa || "—"}</td><td className="px-4 py-3">{resultado.curso}</td><td className="px-4 py-3">{resultado.estado}</td><td className="px-4 py-3">{resultado.calificacionFinal ?? "—"}</td></tr>)}</tbody></table>
      </div>}
    </section>}
  </div>;
}

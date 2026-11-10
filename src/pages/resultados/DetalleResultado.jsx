import Badge from "../../components/ui/Badge";
import { fechaEvaluacion } from "../../utils/evaluacionUtils";
import { ESTADOS_RESULTADO, notaResultado } from "../../utils/resultadoUtils";

export function EstadoResultado({ resultado }) {
  const estado = ESTADOS_RESULTADO[resultado.estado];
  return <span className="inline-flex flex-wrap gap-2"><Badge variant={estado?.variant}>{estado?.label || resultado.estado}</Badge>{resultado.entregaTardia && <Badge variant="warning">Entrega tardía</Badge>}</span>;
}

export default function DetalleResultado({ resultado }) {
  return <div className="space-y-4 text-xs">
    <p className="text-slate-500">Registrado el {fechaEvaluacion(resultado.fechaRegistro)} · Intento {resultado.numeroIntento}</p>
    <div><h3 className="mb-2 font-semibold">Contenido entregado</h3><p className="whitespace-pre-wrap break-words text-slate-600">{resultado.contenidoEntrega || "Sin contenido de texto."}</p></div>
    <div><h3 className="mb-2 font-semibold">Calificación registrada</h3><p className="text-primary font-semibold">{notaResultado(resultado.calificacion)}</p></div>
    <div><h3 className="mb-2 font-semibold">Retroalimentación</h3><p className="whitespace-pre-wrap break-words text-slate-600">{resultado.retroalimentacion || "Sin retroalimentación."}</p></div>
  </div>;
}

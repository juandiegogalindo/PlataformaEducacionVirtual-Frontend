import test from "node:test";
import assert from "node:assert/strict";
import { nombreArchivoRespuesta, prepararFiltrosReporte, resultadosReporte, validarFiltrosReporte } from "../src/utils/reportes.js";
import { ROLES } from "../src/auth/roles.js";

test("valida tipo y período obligatorios del reporte", () => {
  assert.match(validarFiltrosReporte({ tipoReporte: "", periodo: "" }), /tipo/);
  assert.match(validarFiltrosReporte({ tipoReporte: "MATRICULAS", periodo: "" }), /período/);
  assert.match(validarFiltrosReporte({ tipoReporte: "MATRICULAS", periodo: "2026" }), /YYYY/);
  assert.equal(validarFiltrosReporte({ tipoReporte: "MATRICULAS", periodo: "2026-2" }), "");
});

test("prepara la consulta con los filtros acordados y omite opcionales vacíos", () => {
  assert.deepEqual(prepararFiltrosReporte({ tipoReporte: "matriculas", periodo: " 2026-1 ", programa: " Sistemas ", cursoId: "7" }), {
    tipoReporte: "MATRICULAS", periodo: "2026-1", programa: "Sistemas", cursoId: 7,
  });
  assert.deepEqual(prepararFiltrosReporte({ tipoReporte: "MATRICULAS", periodo: "2026-1", programa: "", cursoId: "" }), {
    tipoReporte: "MATRICULAS", periodo: "2026-1",
  });
});

test("normaliza resultados vacíos y conserva el nombre de archivos descargables", () => {
  assert.deepEqual(resultadosReporte({ totalRegistros: 0, resultados: [] }), []);
  assert.equal(nombreArchivoRespuesta({ "content-disposition": 'attachment; filename="reporte-2026-1.xlsx"' }, "fallback.xlsx"), "reporte-2026-1.xlsx");
  assert.equal(nombreArchivoRespuesta({}, "fallback.pdf"), "fallback.pdf");
});

test("el acceso del reporte está reservado al Coordinador Académico", () => {
  assert.equal(ROLES.COORDINADOR, "CoordinadorAcademico");
  assert.notEqual(ROLES.ESTUDIANTE, ROLES.COORDINADOR);
  assert.notEqual(ROLES.DOCENTE, ROLES.COORDINADOR);
});

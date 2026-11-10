import test from "node:test";
import assert from "node:assert/strict";
import { notaResultado, restriccionEntrega, resultadosEvaluacion, validarCalificacion, validarContenido } from "../src/pages/resultados/resultadoUtils.js";

test("una tarea exige texto y un examen permite contenido opcional", () => {
  assert.match(validarContenido("   \n", "tareas"), /contenido/);
  assert.equal(validarContenido("Mi respuesta", "tareas"), "");
  assert.equal(validarContenido("", "examenes"), "");
});

test("la entrega es única y los intentos no pueden superar el límite", () => {
  const evaluacion = { estado: "PUBLICADA", numeroIntentosPermitidos: 2 };
  assert.equal(restriccionEntrega(evaluacion, "tareas", []), "");
  assert.match(restriccionEntrega(evaluacion, "tareas", [{}]), /una entrega/);
  assert.equal(restriccionEntrega(evaluacion, "examenes", [{}]), "");
  assert.match(restriccionEntrega(evaluacion, "examenes", [{}, {}]), /intentos/);
  for (const estado of ["BORRADOR", "CERRADA"]) {
    assert.match(restriccionEntrega({ ...evaluacion, estado }, "examenes", []), /no admite/);
  }
});

test("las fechas las valida el servidor para no depender del reloj o zona horaria del navegador", () => {
  assert.equal(restriccionEntrega({ estado: "PUBLICADA", fechaLimite: "2000-01-01T00:00" }, "tareas", []), "");
});

test("el historial usa evaluación y curso, conserva todos los intentos y los ordena sin mutar la fuente", () => {
  const datos = [
    { id: 1, evaluacionId: 10, cursoId: 2, numeroIntento: 1 },
    { id: 2, evaluacionId: 10, cursoId: 3, numeroIntento: 1 },
    { id: 3, evaluacionId: 10, cursoId: 2, numeroIntento: 2 },
    { id: 4, evaluacionId: 11, cursoId: 2, numeroIntento: 1 },
  ];
  assert.deepEqual(resultadosEvaluacion(datos, "10", "2").map((r) => r.id), [3, 1]);
  assert.equal(datos[0].id, 1);
});

test("se admiten notas cero y cinco, rechazando vacías, no finitas y fuera de escala", () => {
  for (const nota of ["0", "5", "4.75"]) assert.equal(validarCalificacion(nota), "");
  for (const nota of ["", "  ", "NaN", "Infinity", "-0.01", "5.01"]) assert.notEqual(validarCalificacion(nota), "");
  assert.equal(notaResultado(0), "0 / 5");
  assert.equal(notaResultado(null), "Sin calificar");
  assert.equal(notaResultado(4.5), "4,5 / 5");
});

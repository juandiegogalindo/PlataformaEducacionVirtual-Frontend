import test from "node:test";
import assert from "node:assert/strict";
import { pesoTotal, prepararEvaluacion, validarEvaluacion } from "../src/utils/evaluacionUtils.js";

const form = {
  titulo: " Taller 1 ", descripcion: " Descripción ", instrucciones: " Resolver los ejercicios ",
  pesoPorcentual: "20", fechaLimite: "2026-11-20T23:59", permiteEntregaTardia: false,
  penalizacionTardanzaPorcentaje: "10", fechaAplicacion: "2026-11-18T08:00",
  tiempoLimite: "60", numeroIntentosPermitidos: "2", aleatorio: true,
};

test("el presupuesto de peso incluye borradores, publicadas y cerradas", () => {
  const actual = pesoTotal([
    { estado: "BORRADOR", pesoPorcentual: 20 }, { estado: "PUBLICADA", pesoPorcentual: 30 },
    { estado: "CERRADA", pesoPorcentual: 30 },
  ]);
  assert.equal(validarEvaluacion(form, "TAREA", actual), "");
  assert.match(validarEvaluacion({ ...form, pesoPorcentual: "20.01" }, "TAREA", actual), /100/);
});

test("rechaza títulos vacíos y pesos fuera de rango o no numéricos", () => {
  assert.match(validarEvaluacion({ ...form, titulo: "   " }, "TAREA", 0), /título/);
  for (const pesoPorcentual of ["", "0", "-1", "101", "NaN", "Infinity"]) {
    assert.match(validarEvaluacion({ ...form, pesoPorcentual }, "EXAMEN", 0), /peso/);
  }
  assert.equal(validarEvaluacion({ ...form, pesoPorcentual: "0.1" }, "TAREA", 99.9), "");
});

test("exige fechas y enteros positivos para duración e intentos", () => {
  assert.match(validarEvaluacion({ ...form, fechaLimite: "" }, "TAREA", 0), /fecha/);
  assert.match(validarEvaluacion({ ...form, fechaAplicacion: "no-fecha" }, "EXAMEN", 0), /fecha/);
  assert.match(validarEvaluacion({ ...form, tiempoLimite: "1.5" }, "EXAMEN", 0), /duración/);
  assert.match(validarEvaluacion({ ...form, numeroIntentosPermitidos: "0" }, "EXAMEN", 0), /intentos/);
  assert.equal(validarEvaluacion(form, "EXAMEN", 0), "");
});

test("solo valida penalización cuando se admiten entregas tardías", () => {
  assert.equal(validarEvaluacion({ ...form, penalizacionTardanzaPorcentaje: "-1" }, "TAREA", 0), "");
  for (const valor of ["-1", "101", "NaN"]) {
    assert.match(validarEvaluacion({ ...form, permiteEntregaTardia: true, penalizacionTardanzaPorcentaje: valor }, "TAREA", 0), /penalización/);
  }
});

test("la tarea envía el contrato del backend sin campos de examen ni conversión de zona horaria", () => {
  assert.deepEqual(prepararEvaluacion(form, "TAREA"), {
    titulo: "Taller 1", descripcion: "Descripción", pesoPorcentual: 20,
    instrucciones: "Resolver los ejercicios", fechaLimite: "2026-11-20T23:59",
    permiteEntregaTardia: false, penalizacionTardanzaPorcentaje: null,
  });
  assert.equal(prepararEvaluacion({ ...form, permiteEntregaTardia: true }, "TAREA").penalizacionTardanzaPorcentaje, 10);
});

test("el examen envía números y configuración sin arrastrar campos de tarea", () => {
  assert.deepEqual(prepararEvaluacion(form, "EXAMEN"), {
    titulo: "Taller 1", descripcion: "Descripción", pesoPorcentual: 20,
    fechaAplicacion: "2026-11-18T08:00", tiempoLimite: 60, numeroIntentosPermitidos: 2, aleatorio: true,
  });
});

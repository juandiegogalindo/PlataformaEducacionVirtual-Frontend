# Bits Criollos · Plataforma de Educación Virtual - Bit Criollo (Frontend)

### Rama `pruebas` · Fase de validación

![Rama](https://img.shields.io/badge/rama-pruebas-F59E0B)
![Estado](https://img.shields.io/badge/estado-en%20validaci%C3%B3n-F59E0B)
![React](https://img.shields.io/badge/React-SPA-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)

> **Esta rama no se edita directamente.** Recibe el código de `desarrollo`, se valida por completo y, solo si supera los criterios de salida, pasa a `main`. Si una prueba revela un error, se corrige en `desarrollo` y se vuelve a subir a esta rama.


## Propósito de la rama

`pruebas` es la **fase de validación** del frontend de Aularia. Aquí se verifica, con todo lo que existe hasta el momento, que la aplicación funciona de extremo a extremo antes de convertirse en el producto final de `main`.

| Rama | Papel |
|---|---|
| `desarrollo` | Donde se escribe y se integra el código nuevo. |
| **`pruebas`** | **Donde se valida el código de `desarrollo`.** (esta rama) |
| `main` | El producto final: solo recibe lo que ya superó las pruebas. |

## Flujo de código

```text
desarrollo ──merge──▶ pruebas ──(aprobada)──▶ main
    ▲                    │
    └──── corregir ◀─────┘   si se encuentra un error
```

1. Se actualiza `pruebas` con el estado actual de `desarrollo`.
2. Se ejecuta el [plan de pruebas](#plan-de-pruebas) completo.
3. Los errores se registran, se corrigen **en `desarrollo`** y se vuelven a traer a esta rama.
4. Se repite hasta cumplir los [criterios de salida](#criterios-de-salida-hacia-main).
5. Solo entonces se une `pruebas` con `main`.

## Puesta en marcha del entorno de pruebas

### Requisitos

- Node.js 20.19 o superior y npm 10 o superior
- Navegador Chrome o Edge, con las herramientas de desarrollo (F12) a mano
- Una instancia del [backend](https://github.com/juandiegogalindo/PlataformaEducacionVirtual-Backend) en ejecución, con datos de prueba cargados

### Pasos

```bash
git clone https://github.com/juandiegogalindo/PlataformaEducacionVirtual-Frontend.git
cd PlataformaEducacionVirtual-Frontend
git checkout pruebas
git pull origin pruebas
npm install
cp .env.example .env          # en PowerShell: Copy-Item .env.example .env
npm run dev
```

La aplicación queda en `http://localhost:5173`.

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend, **sin barra final**. | `http://localhost:8080` |

El backend debe incluir el origen del frontend en `CORS_ALLOWED_ORIGINS` (por defecto acepta `http://localhost:5173`). Antes de empezar, anota **contra qué backend y versión** se está probando, porque un cambio en el backend puede producir fallos que no son del frontend.

> Si el backend está en un plan que se suspende por inactividad, la primera petición puede tardar varios segundos. Espera antes de dar la prueba por fallida.

## Usuarios y datos de prueba

Con el script `02_poblacion.sql` del backend existe un usuario por rol, todos con la contraseña `clave12345`. Ejemplos: `admin@test.com` (administrador) y `coord@test.com` (coordinador). Los estudiantes se crean desde la pantalla de registro, y los docentes los crea un administrador desde el módulo de usuarios.

Para cubrir todos los casos se recomienda preparar:

- Un curso **activo** con cupo disponible, uno con **cupo lleno** y uno **archivado**.
- Un estudiante **inscrito** y otro **sin inscripción** en el mismo curso.
- Un curso con lecciones, recursos y evaluaciones, y otro completamente **vacío**.

> Estos datos son exclusivamente para pruebas. No uses datos reales.

## Alcance de la validación

| Se valida | No se valida en esta fase |
|---|---|
| Flujos funcionales por rol en la interfaz | Lógica interna del backend (se prueba con su colección de Postman) |
| Rutas protegidas y redirecciones | Pruebas de carga y rendimiento |
| Manejo de errores y estados vacíos | Reportes académicos del coordinador (aún no implementados) |
| Sesión y renovación de tokens | Recuperación de contraseña y verificación de correo (el backend aún no los ofrece) |
| Compilación (`build`) y calidad de código (`lint`) | |

## Verificaciones técnicas

Antes de cada ciclo de pruebas, y como parte de los criterios de salida:

```bash
npm install
npm run lint        # debe terminar sin errores
npm run build       # debe compilar sin errores
npm run preview     # revisar la versión de producción
```

`npm run dev` puede funcionar aunque `build` falle, por lo que **la compilación de producción debe probarse siempre**.

## Criterios de salida hacia main

> Propuesta de partida. Ajústala al acuerdo del equipo.

La rama `pruebas` pasa a `main` cuando se cumplen **todos** estos puntos:

- [ ] Todos los casos del plan se ejecutaron con los roles que corresponden.
- [ ] No hay errores **críticos** ni **altos** abiertos.
- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] Los flujos principales funcionan de extremo a extremo: registro, inscripción, evaluación, calificación y foro.
- [ ] No quedan archivos sin rastrear que la aplicación necesite (`git status` limpio).
- [ ] Se probó contra el backend que se usará en producción.
- [ ] Al menos dos integrantes del equipo revisaron y aprobaron el resultado.
- [ ] Se dejó constancia del ciclo de pruebas en el [registro](#registro-de-ciclos-de-prueba).

### Severidad de los errores

| Nivel | Descripción | ¿Bloquea el paso a main? |
|---|---|---|
| **Crítico** | La aplicación no arranca o no se puede usar (pantalla en blanco, no se puede iniciar sesión) | Sí |
| **Alto** | Un flujo principal falla o un rol accede a lo que no debe | Sí |
| **Medio** | Una funcionalidad secundaria falla o hay un mensaje de error incorrecto | Se decide caso por caso |
| **Bajo** | Detalle visual o de texto sin impacto funcional | No |

## Cómo reportar un error

Abre un *issue* en GitHub con esta plantilla:

```markdown
**ID del caso:** (por ejemplo FO-03)
**Severidad:** Crítico / Alto / Medio / Bajo
**Rol con el que se probó:**
**Navegador y versión:**
**Commit probado:** (resultado de `git rev-parse --short HEAD`)

**Pasos para reproducirlo**
1.
2.
3.

**Resultado esperado**

**Resultado obtenido**

**Evidencia**
Captura de pantalla, error de la consola (F12) y, si aplica, el código de estado y la respuesta de la pestaña Network.
```

Un buen reporte incluye siempre el **código de estado HTTP** (por ejemplo 403 o 500) y el mensaje de la respuesta: permite saber de inmediato si el fallo está en el frontend o en el backend.

## Registro de ciclos de prueba

| Ciclo | Fecha | Commit | Backend probado | Responsable | Casos aprobados | Errores abiertos | Resultado |
|---|---|---|---|---|---|---|---|
| 1 | | | | | / | | ⬜ |
| 2 | | | | | / | | ⬜ |

## Limitaciones conocidas

Comportamientos ya identificados que **no son errores nuevos**, para no reportarlos como tales:

- **Foro:** el backend no devuelve el identificador del autor, así que la interfaz reconoce los mensajes propios por el nombre. Además, la insignia "Docente" depende de que el backend informe bien el rol del autor.
- **Foro y coordinador:** el backend lo permite, pero la interfaz aún no habilita esa ruta para el coordinador.
- **Reportes académicos:** definidos en el SDS, todavía no implementados.
- **Sesión:** los tokens se guardan en `localStorage`.
- **Idioma:** la interfaz solo está en español.

## Documentación del proyecto

- [Plataforma de Información](https://bit-criollo-delta.vercel.app/): API REST, reglas de negocio y colección de Postman

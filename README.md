# Bits Criollos · Plataforma de Educación Virtual Frontend

Aplicación web para una plataforma de educación virtual con gestión de cursos, inscripciones, lecciones, evaluaciones, calificaciones y foros, construida con React y Vite sobre la API REST del backend de Bit Criollo.

![React](https://img.shields.io/badge/React-SPA-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Estilos-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-Rutas-CA4245?logo=reactrouter&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-Estado-433E38)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-Calidad-4B32C3?logo=eslint&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Despliegue-000000?logo=vercel&logoColor=white)

---

## Tabla de contenidos

1. [Descripción](#descripción)
2. [Características principales](#características-principales)
3. [Roles y permisos](#roles-y-permisos)
4. [Tecnologías utilizadas](#tecnologías-utilizadas)
5. [Arquitectura y estructura del proyecto](#arquitectura-y-estructura-del-proyecto)
6. [Requisitos previos](#requisitos-previos)
7. [Instalación y ejecución](#instalación-y-ejecución)
8. [Configuración](#configuración)
9. [Autenticación y sesión](#autenticación-y-sesión)
10. [Mapa de rutas](#mapa-de-rutas)
11. [Comportamiento de la interfaz](#comportamiento-de-la-interfaz)
12. [Convenciones de código](#convenciones-de-código)
13. [Flujo de trabajo y ramas](#flujo-de-trabajo-y-ramas)
14. [Despliegue](#despliegue)
15. [Solución de problemas](#solución-de-problemas)
16. [Limitaciones conocidas](#limitaciones-conocidas)
17. [Roadmap](#roadmap)
18. [Equipo](#equipo)

---

## Descripción

**Bits Criollos** es la interfaz web de la plataforma de educación virtual de la **Organización Bit Criollo**. Centraliza en una sola aplicación las actividades académicas de una institución: consulta del catálogo de cursos, inscripción de estudiantes, lecciones, recursos bibliográficos, seguimiento del progreso, evaluaciones (exámenes y tareas), calificaciones y un foro por curso.

Este repositorio contiene el **frontend**: una aplicación de página única (SPA) que consume la API REST del backend y adapta la interfaz al rol de cada usuario. Las pantallas siguen la Especificación de Diseño de Software (SDS) del proyecto. Fue desarrollada como proyecto académico del curso de Ingeniería de Software de la Universidad Piloto de Colombia (ciclo 2026-2).

| Repositorio | Contenido |
|---|---|
| **Frontend** (este) | Aplicación web en React |
| [Backend](https://github.com/juandiegogalindo/PlataformaEducacionVirtual-Backend) | API REST con Spring Boot, Spring Security y JWT |

## Características principales

- Registro de estudiantes e inicio de sesión, con renovación automática de la sesión mediante *refresh token*.
- Interfaz diferenciada por rol (Estudiante, Docente, Coordinador Académico y Administrador), con rutas protegidas.
- Catálogo de cursos, detalle del curso y gestión de cursos para los roles autorizados.
- Inscripción a cursos, consulta de "Mis cursos" y cancelación de la inscripción.
- Lecciones del curso y seguimiento del progreso del estudiante.
- Recursos bibliográficos: consulta para estudiantes inscritos y administración (alta, edición y eliminación) para docentes y coordinadores.
- Evaluaciones de dos tipos, exámenes y tareas: listado por curso, detalle, entrega por parte del estudiante y creación por parte del docente.
- Calificaciones: consulta de notas propias para el estudiante y vista por curso para el docente.
- Foro por curso con publicaciones, hilos de respuestas anidadas, y edición o eliminación de mensajes.
- Perfil de usuario con actualización de datos.
- Administración de usuarios para el rol administrador.
- Estados vacíos, de carga y de acceso restringido cuidados en cada módulo, en lugar de mensajes de error genéricos.

## Roles y permisos

El acceso a cada ruta se controla en el frontend con `ProtectedRoute`. Esto mejora la experiencia, pero **la autorización real la aplica el backend**, que valida el rol y la pertenencia al curso en cada petición.

| Rol | Qué puede hacer en la aplicación |
|---|---|
| **Estudiante** | Explorar el catálogo, inscribirse y cancelar, consultar lecciones y progreso, presentar evaluaciones, ver sus calificaciones, consultar recursos bibliográficos y participar en el foro. |
| **Docente** | Crear y editar sus cursos, administrar recursos bibliográficos, crear evaluaciones, calificar, consultar las calificaciones de sus cursos y participar en el foro. |
| **Coordinador Académico** | Crear y gestionar cursos, y administrar los recursos bibliográficos de cualquier curso. |
| **Administrador** | Gestionar usuarios desde el módulo `/admin`. |

Los grupos de roles `ROLES_GESTION_CURSOS` y `ROLES_EVALUACIONES` se definen en `src/auth/roles.js`.

## Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| Librería de interfaz | React |
| Herramienta de desarrollo y build | Vite |
| Estilos | Tailwind CSS |
| Enrutamiento | React Router |
| Estado global (sesión) | Zustand |
| Cliente HTTP | Axios, con interceptores de sesión |
| Calidad de código | ESLint con reglas de `react-hooks` |
| Despliegue | Vercel |

Las versiones exactas de cada dependencia están en `package.json`.

## Arquitectura y estructura del proyecto

```text
PlataformaEducacionVirtual-Frontend/
├── public/                         # Archivos estáticos
├── src/
│   ├── api/                        # Un módulo por recurso del backend
│   │   ├── axiosInstance.js        # Cliente Axios con interceptores de sesión
│   │   ├── auth.js, perfil.js, admin.js
│   │   ├── cursos.js, inscripciones.js, docentes.js, estudiantes.js
│   │   ├── lecciones.js, progreso.js, recursosBibliograficos.js
│   │   └── evaluaciones.js, resultados.js, foro.js
│   ├── assets/                     # Imágenes y recursos gráficos
│   ├── auth/
│   │   ├── authStore.js            # Estado de sesión (Zustand)
│   │   └── roles.js                # Constantes de roles y grupos de roles
│   ├── components/
│   │   └── layout/                 # Layout, menú lateral y migas de pan
│   ├── pages/                      # Una carpeta por módulo funcional
│   │   ├── admin/                  # Gestión de usuarios
│   │   ├── cursos/                 # Catálogo, detalle, formulario e inscripciones
│   │   ├── lecciones/
│   │   ├── evaluaciones/
│   │   ├── resultados/             # Calificaciones
│   │   ├── foro/
│   │   ├── recursosBibliograficos/
│   │   ├── estudiantes/
│   │   ├── perfil/
│   │   └── login/                  # Inicio de sesión y registro
│   ├── routes/
│   │   └── ProtectedRoute.jsx      # Protección de rutas por sesión y rol
│   ├── utils/                      # Utilidades compartidas y por módulo
│   ├── tests/
│   ├── App.jsx                     # Definición de rutas
│   └── main.jsx                    # Punto de entrada
├── .env.example                    # Plantilla de variables de entorno
├── eslint.config.js
├── vercel.json                     # Configuración de despliegue en Vercel
└── vite.config.js
```

Flujo típico de una interacción: la **página** (`pages/`) dispara una función del **módulo de API** (`api/`); esta usa la instancia compartida de **Axios**, que agrega el token de acceso; el **backend** valida y responde; y la página actualiza su estado y muestra el resultado, o el estado de error que corresponda.

## Requisitos previos

- Node.js 20.19 o superior (se recomienda la versión LTS más reciente)
- npm 10 o superior
- Una instancia del [backend](https://github.com/juandiegogalindo/PlataformaEducacionVirtual-Backend) en ejecución, local o desplegada

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/juandiegogalindo/PlataformaEducacionVirtual-Frontend.git
cd PlataformaEducacionVirtual-Frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

```bash
cp .env.example .env
```

En Windows (PowerShell): `Copy-Item .env.example .env`. Consulta la sección [Configuración](#configuración).

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión de producción para revisarla |
| `npm run lint` | Ejecuta ESLint sobre el proyecto (equivale a `npx eslint .`) |

### Usuarios de prueba

Si el backend se inició con el script `02_poblacion.sql`, existe un usuario por rol, todos con la contraseña `clave12345`. Ejemplos: `admin@test.com` (administrador) y `coord@test.com` (coordinador). Los estudiantes pueden crear su propia cuenta desde la pantalla de registro. Estos datos son exclusivamente para desarrollo.

## Configuración

La configuración se inyecta mediante variables de entorno, definidas en un archivo `.env` en la raíz del proyecto. El archivo `.env` no se sube al repositorio; usa `.env.example` como plantilla.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend, **sin barra final**. Las rutas del cliente ya incluyen el prefijo `/api`. | `http://localhost:8080` |

- Vite solo expone al navegador las variables que empiezan con `VITE_`.
- Tras modificar el `.env`, reinicia `npm run dev`.
- El backend debe permitir el origen del frontend en su variable `CORS_ALLOWED_ORIGINS`. Por defecto acepta `http://localhost:5173`, que es el puerto de desarrollo de esta aplicación. Si despliegas el frontend, agrega su dominio.

## Autenticación y sesión

1. El usuario inicia sesión con `POST /api/auth/login` o se registra como estudiante con `POST /api/auth/registro`.
2. La respuesta trae el `accessToken` (expira a los 15 minutos), el `refreshToken` (expira a los 7 días) y el rol. Después se consulta el perfil con `GET /api/perfil`.
3. `authStore` (Zustand) guarda `user`, `accessToken` y `refreshToken`, y los persiste en `localStorage` para mantener la sesión al recargar.
4. `axiosInstance` agrega `Authorization: Bearer <accessToken>` a cada petición, excepto a las de autenticación.
5. Ante un `401`, la instancia solicita un nuevo token con `POST /api/auth/refresh` y reintenta la petición original. Como el backend revoca cada *refresh token* al usarlo, **solo se hace una renovación a la vez**: las demás peticiones fallidas esperan en una cola y se reintentan con el token nuevo.
6. Si la renovación falla, se limpia la sesión y se redirige a `/login`.
7. Al cerrar sesión se revoca el *refresh token* en el backend; si el backend no responde, la sesión local se limpia de todos modos.

`ProtectedRoute` exige sesión activa y, cuando recibe `allowedRoles`, que el rol del usuario esté permitido. Todas las rutas autenticadas se muestran dentro de `Layout`, que aporta el encabezado, el menú lateral y las migas de pan.

## Mapa de rutas

| Ruta | Acceso | Pantalla |
|---|---|---|
| `/login`, `/registro` | Público | Inicio de sesión y registro de estudiantes |
| `/perfil` | Autenticado | Perfil del usuario |
| `/cursos` | Autenticado | Catálogo de cursos |
| `/cursos/:id` | Autenticado | Detalle del curso: inscripción, contenido y recursos bibliográficos |
| `/cursos/nuevo`, `/cursos/:id/editar` | Roles de gestión de cursos | Formulario de curso |
| `/cursos/:cursoId/recursos` | Docente, Coordinador | Administración de recursos bibliográficos |
| `/inscripciones` | Estudiante | Mis cursos |
| `/evaluaciones` | Roles con acceso a evaluaciones | Evaluaciones |
| `/cursos/:cursoId/evaluaciones` | Roles con acceso a evaluaciones | Evaluaciones de un curso |
| `/cursos/:cursoId/evaluaciones/nueva` | Docente | Crear evaluación |
| `/cursos/:cursoId/evaluaciones/:tipo/:evaluacionId` | Roles con acceso a evaluaciones | Detalle y entrega de una evaluación |
| `/calificaciones` | Estudiante, Docente | Calificaciones |
| `/cursos/:cursoId/calificaciones` | Docente | Calificaciones de un curso |
| `/foro`, `/foro/:cursoId` | Estudiante, Docente | Foro del curso |
| `/foro/:cursoId/tema/:mensajeId` | Estudiante, Docente | Hilo de una publicación |
| `/admin/usuarios`, `/admin/usuarios/nuevo` | Administrador | Gestión de usuarios |

## Comportamiento de la interfaz

Reglas del backend que la interfaz refleja para que el usuario no se encuentre con botones o mensajes que no corresponden:

- **Foro**
  - El panel "Foros disponibles" muestra solo los cursos activos del usuario: los archivados y las inscripciones canceladas no aparecen.
  - Si se abre el foro de un curso que ya no está disponible, la aplicación redirige al primer foro activo.
  - El backend no maneja títulos de publicación, por lo que el título que se muestra es la primera línea del mensaje.
  - Las respuestas se muestran anidadas. Cada usuario puede editar y eliminar sus propios mensajes, y el docente puede editar los de sus estudiantes para corregirlos.
  - Los mensajes y errores se asocian al curso que los originó, de modo que al cambiar de curso nunca se muestra contenido de otro.
- **Recursos bibliográficos**
  - El estudiante solo consulta: los botones de agregar, editar y eliminar se muestran únicamente a los roles que pueden administrarlos.
  - Un curso sin recursos muestra un estado vacío informativo, no un error. Para un docente incluye la acción de agregar el primer recurso.
  - Un estudiante sin inscripción (respuesta `403`) ve un aviso de acceso restringido que lo invita a inscribirse, y no un fallo genérico.
  - Solo los fallos reales, como una caída del servidor o de la red, muestran un mensaje de error con la opción de reintentar.
- **Cursos e inscripciones**
  - El acceso al contenido de un curso depende del estado de la inscripción. Los mensajes del backend, como cupo lleno o inscripción duplicada, se muestran al usuario.

## Convenciones de código

- **Un módulo de API por recurso.** Cada función del directorio `src/api/` corresponde a un endpoint y devuelve la promesa de Axios. No contiene lógica de interfaz.
- **Carga de datos dentro del efecto.** Las reglas de `react-hooks` no permiten llamar a una función que haga `setState` de forma síncrona dentro de un `useEffect`. El patrón del proyecto es pedir los datos dentro del efecto, actualizar el estado en el `.then` y cancelar con una bandera al desmontar:

  ```jsx
  useEffect(() => {
    let cancelado = false;
    listarMensajes(cursoId)
      .then(({ data }) => {
        if (!cancelado) setMensajes(data);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar el foro.");
      });
    return () => { cancelado = true; };
  }, [cursoId]);
  ```

- **Estado derivado en lugar de estado duplicado.** Valores como `cargando` se calculan en el render a partir de otros.
- **Datos ligados a su contexto.** El estado que depende de un curso guarda a qué curso pertenece.
- **Sin variables sin usar.** Cuando no se usa el error de un `catch`, se escribe `catch {`.
- **Antes de cada commit**, ejecutar `npm run lint` y comprobar que no hay errores.

## Flujo de trabajo y ramas

| Rama | Propósito |
|---|---|
| `main` | Versión estable. Es la mejor versión del producto y solo recibe código que ya superó la fase de pruebas. |
| `pruebas` | Fase de validación. Recibe el código de `desarrollo` y se prueba completo antes de pasar a `main`. |
| `desarrollo` | Rama de trabajo. Aquí se edita y se integra el código nuevo. |

El código fluye en una sola dirección: **`desarrollo` → `pruebas` → `main`**. No se edita directamente en `pruebas` ni en `main`: si una prueba revela un error, se corrige en `desarrollo` y se vuelve a subir.

Para contribuir:

1. Actualizar `desarrollo` y crear una rama de trabajo: `git checkout -b feature/nombre`.
2. Hacer commits pequeños y descriptivos, por ejemplo `feat(foro): agrega edición de mensajes`.
3. Verificar con `npm run lint` y `npm run build`.
4. Abrir un Pull Request hacia `desarrollo` y esperar la revisión de al menos un compañero.

## Despliegue

El repositorio incluye `vercel.json`, por lo que la aplicación se despliega en **Vercel**:

1. Importar el repositorio en Vercel y elegir la rama que se va a publicar.
2. Definir la variable `VITE_API_URL` apuntando al backend desplegado.
3. Usar el comando de build `npm run build` y el directorio de salida `dist`.
4. Agregar el dominio resultante a `CORS_ALLOWED_ORIGINS` en el backend.

Si el backend está en un plan que se suspende por inactividad, la primera petición después de un rato puede tardar varios segundos.

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Pantalla en blanco en toda la aplicación | Un `import` falla al cargar, o hay un error de renderizado | Abrir la consola del navegador (F12) y leer el primer error en rojo |
| `Failed to resolve import "./archivo"` | El archivo se movió, se renombró o no está en el repositorio | Revisar la ruta del import; comprobar con `git status` que el archivo no esté sin rastrear |
| `No routes matched location` | La ruta no está registrada en `App.jsx` | Registrar la ruta dentro del bloque protegido |
| Errores de CORS o peticiones que no llegan | `VITE_API_URL` incorrecta o el origen no está permitido en el backend | Revisar el `.env`, reiniciar `npm run dev` y comprobar `CORS_ALLOWED_ORIGINS` en el backend |
| Respuestas `404` en todas las llamadas | `VITE_API_URL` con ruta de más, o el prefijo `/api` repetido | Dejar la URL base sin barra final y sin `/api` |
| `403` en un curso | El usuario no está inscrito, la inscripción está cancelada o el curso está archivado | Es el comportamiento esperado del backend; probar con un curso activo en el que el usuario esté inscrito |
| `401` y vuelta al login | El refresh token expiró (7 días) o fue revocado | Iniciar sesión de nuevo |
| El `build` falla pero `npm run dev` funciona | Error que solo aparece al compilar | Ejecutar `npm run lint` y `npm run build` y corregir lo que reporten |

## Limitaciones conocidas

- **Tokens en `localStorage`.** Es una solución simple y habitual en proyectos académicos, pero deja los tokens expuestos ante un ataque XSS. Una alternativa más robusta son las cookies `httpOnly`.
- **Foro:** el backend no devuelve el identificador del autor de cada mensaje, así que la interfaz identifica "mis mensajes" comparando el nombre. Dos usuarios con el mismo nombre podrían confundirse. Además, la insignia "Docente" depende de que el backend informe correctamente el rol del autor.
- **Foro y coordinador:** el backend permite al coordinador usar el foro, pero la interfaz aún no habilita esa ruta para ese rol.
- **Reportes académicos:** el SDS define el módulo de reportes para el coordinador (consulta con filtros y exportación a PDF y Excel), que todavía no está implementado.
- **Sin recuperación de contraseña ni verificación de correo.** El backend aún no ofrece esos flujos.
- **Idioma único.** La interfaz está solo en español.

## Roadmap

- Módulo de reportes académicos para el coordinador.
- Habilitar el foro para el rol coordinador.
- Identificar a los autores del foro por identificador en lugar de por nombre, cuando el backend lo exponga.
- Pruebas automatizadas de componentes y de los flujos principales.
- Evaluar el paso de los tokens a cookies `httpOnly`.
- Recuperación de contraseña y verificación de correo, cuando el backend los incorpore.

## Equipo

Proyecto desarrollado por el grupo **Bit Criollo** en la Universidad Piloto de Colombia (ciclo 2026-2).

Contribuyentes según el historial de commits del repositorio:

| Usuario de GitHub | Perfil |
|---|---|
| juandiegogalindo | [@juandiegogalindo](https://github.com/juandiegogalindo) |
| CristianCortes1 | [@CristianCortes1](https://github.com/CristianCortes1) |
| Sofia-Torres11 | [@Sofia-Torres11](https://github.com/Sofia-Torres11) |
| miguelardila | [@miguelardila](https://github.com/miguelardila) |
| JPcoronado3 | [@JPcoronado3](https://github.com/JPcoronado3) |

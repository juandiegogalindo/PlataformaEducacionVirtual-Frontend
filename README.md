<div align="center">

# Bits Criollos · Plataforma de Educación Virtual

**Frontend web de la plataforma de educación virtual de Bit Criollo**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white&style=flat-square)
![Rama](https://img.shields.io/badge/rama-desarrollo-2563EB?style=flat-square)

</div>

---

## Descripción

**Bits Criollos** es una plataforma de educación virtual que permite gestionar cursos, lecciones, evaluaciones, calificaciones y la comunicación entre docentes y estudiantes. Este repositorio contiene el **frontend**, una aplicación de página única (SPA) que consume la API REST del backend.

El diseño de las pantallas sigue la Especificación de Diseño de Software (SDS) del proyecto, desarrollado por el grupo **Bit Criollo** de la Universidad Piloto de Colombia (ciclo 2026-2).

> Este README corresponde a la rama **`desarrollo`**, donde se integra el trabajo en curso antes de pasar a producción.

## Funcionalidades

| Módulo | Descripción |
|---|---|
| **Autenticación** | Registro, inicio de sesión, cierre de sesión y renovación automática de la sesión con refresh token. |
| **Cursos** | Catálogo de cursos, detalle del curso, creación y edición para los roles de gestión. |
| **Inscripciones** | Inscripción a un curso desde el catálogo, consulta de "Mis cursos" y cancelación. |
| **Lecciones y progreso** | Contenido del curso y seguimiento del avance del estudiante. |
| **Recursos bibliográficos** | Consulta de la bibliografía del curso; alta, edición y eliminación para docentes. |
| **Evaluaciones** | Listado por curso, detalle, entrega y creación de evaluaciones por parte del docente. |
| **Calificaciones** | Consulta de notas por el estudiante y calificación por el docente. |
| **Foro** | Publicaciones por curso, hilos de respuestas, edición y eliminación de mensajes propios. |
| **Perfil** | Consulta y actualización de los datos del usuario. |
| **Administración** | Gestión de usuarios para el rol administrador. |

## Roles y permisos

El acceso a las rutas se controla en el frontend con `ProtectedRoute`; el backend aplica además su propia validación por rol.

| Rol | Acceso principal |
|---|---|
| **Estudiante** | Catálogo, inscripciones, lecciones, evaluaciones, calificaciones propias, foro y consulta de recursos. |
| **Docente** | Gestión de cursos propios, evaluaciones, calificaciones del curso, recursos bibliográficos y foro. |
| **Coordinador** | Gestión de cursos y recursos bibliográficos. |
| **Administrador** | Gestión de usuarios (`/admin`). |

## Tecnologías

- **[React 19](https://react.dev/)** como librería de interfaz.
- **[Vite 8](https://vite.dev/)** como herramienta de desarrollo y build.
- **[Tailwind CSS v4](https://tailwindcss.com/)** para estilos, mediante el plugin `@tailwindcss/vite`.
- **[React Router 7](https://reactrouter.com/)** para el enrutamiento.
- **[Zustand](https://zustand.docs.pmnd.rs/)** para el estado global de autenticación.
- **[Axios](https://axios-http.com/)** para las peticiones HTTP, con interceptores de sesión.
- **[ESLint](https://eslint.org/)** con las reglas de `react-hooks` para mantener la calidad del código.

## Requisitos previos

- **Node.js** 20.19 o superior (se recomienda la versión LTS más reciente).
- **npm** 10 o superior.
- Acceso a una instancia del **backend** de la plataforma, local o desplegada.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente. |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente la versión de producción para revisarla. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto (equivale a `npx eslint .`). |

## Arquitectura

### Capa de acceso a la API

Cada recurso del backend tiene su propio módulo en `src/api/`, que exporta funciones pequeñas que devuelven la promesa de Axios. Todas usan la instancia compartida `axiosInstance`, que:

- toma la URL base de `VITE_API_URL`;
- agrega el encabezado `Authorization: Bearer <accessToken>` en cada petición, salvo en las rutas de autenticación;
- ante un `401`, renueva el token con el refresh token y reintenta la petición. Si hay varias peticiones simultáneas, las encola para hacer una sola renovación;
- distingue solicitudes canceladas, errores temporales y refresh inválidos; sólo una respuesta de refresh inválida cierra la sesión.

### Autenticación y rutas protegidas

El estado de sesión (`user`, `accessToken`, `refreshToken`) vive en `authStore` (Zustand). Mientras el backend conserva el contrato actual, los valores se persisten de forma centralizada en `localStorage`, con limpieza completa si una escritura falla. La migración del refresh token a una cookie `HttpOnly`, `Secure` y `SameSite` requiere cambios coordinados en Spring Boot (cookie, CORS y credenciales) y no se activa sólo desde este frontend.

El modo se controla con `VITE_REFRESH_COOKIE_ENABLED`. En `false` se conserva el contrato JSON actual; en `true` Axios usa credenciales, solicita CSRF y no persiste el refresh token en `localStorage`. Activa este modo sólo después de verificar conjuntamente login, refresh, logout y CSRF contra el backend.

`ProtectedRoute` valida que exista una sesión inicializada y, cuando recibe `allowedRoles`, que el rol esté permitido. Esto es defensa en profundidad: la autorización definitiva y los permisos por recurso deben permanecer en los endpoints del backend.


## Flujo de trabajo

| Rama | Propósito |
|---|---|
| `main` | Versión estable. |
| `desarrollo` | Integración del trabajo en curso. Es la rama base para nuevas funcionalidades. |
| `pruebas` | Trabajo de pruebas de cada funcionalidad o corrección, creado desde `desarrollo`. |

1. Crear una rama desde `desarrollo`: `git checkout -b feature/foro`.
2. Hacer commits pequeños y descriptivos, por ejemplo `feat(foro): agrega edición de mensajes`.
3. Verificar con `npm run lint` y `npm run build`.
4. Abrir un Pull Request hacia `desarrollo` y esperar la revisión de al menos un compañero.




<div align="center">

Proyecto académico · Plataforma de Educación Virtual

</div>

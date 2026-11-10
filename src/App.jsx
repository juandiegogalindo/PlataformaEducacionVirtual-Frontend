import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/login/Login";
import Cursos from "./pages/cursos/Cursos";
import Registro from "./pages/login/Registro";
import CursoDetalle from "./pages/cursos/CursoDetalle";
import MisInscripciones from "./pages/cursos/MisInscripciones";
import Perfil from "./pages/perfil/Perfil";
import CursoForm from "./pages/cursos/CursoForm";
import { ROLES, ROLES_GESTION_CURSOS, ROLES_EVALUACIONES } from "./auth/roles";
import AdminLayout from "./pages/admin/AdminLayout";
import Usuarios from "./pages/admin/Usuarios";
import UsuarioForm from "./pages/admin/UsuarioForm";
import Evaluaciones from "./pages/evaluaciones/Evaluaciones";
import EvaluacionesCurso from "./pages/evaluaciones/EvaluacionesCurso";
import EvaluacionForm from "./pages/evaluaciones/EvaluacionForm";
import EvaluacionDetalle from "./pages/evaluaciones/EvaluacionDetalle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="usuarios" replace />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="usuarios/nuevo" element={<UsuarioForm />} />
          </Route>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/evaluaciones" element={<ProtectedRoute allowedRoles={ROLES_EVALUACIONES}><Evaluaciones /></ProtectedRoute>} />
          <Route path="/cursos/:cursoId/evaluaciones" element={<ProtectedRoute allowedRoles={ROLES_EVALUACIONES}><EvaluacionesCurso /></ProtectedRoute>} />
          <Route path="/cursos/:cursoId/evaluaciones/nueva" element={<ProtectedRoute allowedRoles={[ROLES.DOCENTE]}><EvaluacionForm /></ProtectedRoute>} />
          <Route path="/cursos/:cursoId/evaluaciones/:tipo/:evaluacionId" element={<ProtectedRoute allowedRoles={ROLES_EVALUACIONES}><EvaluacionDetalle /></ProtectedRoute>} />
          <Route path="/cursos" element={<Cursos />} />
          <Route
            path="/cursos/nuevo"
            element={
              <ProtectedRoute allowedRoles={ROLES_GESTION_CURSOS}>
                <CursoForm />
              </ProtectedRoute>
            }
          />
          <Route path="/cursos/:id" element={<CursoDetalle />} />
          <Route
            path="/cursos/:id/editar"
            element={
              <ProtectedRoute allowedRoles={ROLES_GESTION_CURSOS}>
                <CursoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inscripciones"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ESTUDIANTE]}>
                <MisInscripciones />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

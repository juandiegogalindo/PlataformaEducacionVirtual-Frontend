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
import { ROLES, ROLES_GESTION_CURSOS } from "./auth/roles";

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
          <Route path="/perfil" element={<Perfil />} />
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
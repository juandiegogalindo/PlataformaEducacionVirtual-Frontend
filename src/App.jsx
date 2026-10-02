import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/login/Login";
import Cursos from "./pages/cursos/Cursos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/cursos" element={<Cursos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
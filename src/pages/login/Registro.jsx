import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registroRequest } from "../../api/auth";
import { useAuthStore } from "../../auth/authStore";

const initialForm = {
  nombre: "",
  apellido: "",
  correo: "",
  contrasena: "",
  codigoEstudiantil: "",
  tipoDocumento: "",
  numeroDocumento: "",
  programaAcademico: "",
  semestre: "",
};

export default function Registro() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registroRequest({ ...form, semestre: Number(form.semestre) });
      await login(form.correo, form.contrasena);
      navigate("/cursos");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo completar el registro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black py-10">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded w-96 flex flex-col gap-3">
        <h1 className="text-white text-xl font-bold text-center mb-2">Registro de estudiante</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="correo" type="email" placeholder="Correo" value={form.correo} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="contrasena" type="password" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="codigoEstudiantil" placeholder="Código estudiantil" value={form.codigoEstudiantil} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="codigoEstudiantil" placeholder="Código estudiantil" value={form.codigoEstudiantil} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />

        <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required>
        <option value="CEDULA">Cédula</option>
        <option value="TARJETA_DE_IDENTIDAD">Tarjeta de identidad</option>
        <option value="PASAPORTE">Pasaporte</option>
        </select>
        <input name="numeroDocumento" placeholder="Número de documento" value={form.numeroDocumento} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        
        <input name="programaAcademico" placeholder="Programa académico" value={form.programaAcademico} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="semestre" type="number" placeholder="Semestre" value={form.semestre} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />

        <button type="submit" disabled={loading} className="bg-white text-black py-2 rounded font-semibold mt-2">
          {loading ? "Registrando..." : "Registrarme"}
        </button>

        <p className="text-gray-400 text-sm text-center mt-2">
          ¿Ya tienes cuenta? <Link to="/login" className="underline">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
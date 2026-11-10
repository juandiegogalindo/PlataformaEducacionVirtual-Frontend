import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { registroRequest } from "../../api/auth";
import { useAuthStore } from "../../auth/authStore";
import AuthLayout from "../../components/layout/AuthLayout";
import Input, { Select } from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";

const initialForm = {
  nombre: "",
  apellido: "",
  correo: "",
  contrasena: "",
  codigoEstudiantil: "",
  tipoDocumento: "CEDULA",
  numeroDocumento: "",
  programaAcademico: "",
  semestre: "",
};

export default function Registro() {
  const [form, setForm] = useState(initialForm);
  const [confirmar, setConfirmar] = useState("");
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrores((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorGeneral(null);

    if (form.contrasena !== confirmar) {
      setErrores({ confirmar: "Las contraseñas no coinciden" });
      return;
    }

    setLoading(true);
    try {
      await registroRequest({ ...form, semestre: Number(form.semestre) });
      await login(form.correo, form.contrasena);
      navigate("/cursos");
    } catch (err) {
      const mensaje = err.response?.data?.mensaje;
      if (err.response?.status === 409 || /registrad|existe/i.test(mensaje || "")) {
        setErrorGeneral({
          titulo: "Correo ya registrado",
          texto: "Ya existe una cuenta con este correo electrónico. Intente iniciar sesión.",
        });
        setErrores({ correo: "Este correo ya se encuentra registrado" });
      } else {
        setErrorGeneral({
          titulo: "No se pudo completar el registro",
          texto: mensaje || "Intente nuevamente en unos minutos.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      panelTitle="Registro de usuarios"
      title="Crear cuenta"
      subtitle="Complete los datos para registrarse en la plataforma."
      ancho="max-w-md"
    >
      {errorGeneral && (
        <Alert variant="error" title={errorGeneral.titulo} className="mb-5">
          {errorGeneral.texto}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" icon={User} name="nombre" placeholder="Ana María" value={form.nombre} onChange={handleChange} required />
          <Input label="Apellido" icon={User} name="apellido" placeholder="Pérez" value={form.apellido} onChange={handleChange} required />
        </div>

        <Input
          label="Correo electrónico"
          icon={Mail}
          name="correo"
          type="email"
          placeholder="nombre@correo.com"
          value={form.correo}
          onChange={handleChange}
          error={errores.correo}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Contraseña" icon={Lock} name="contrasena" type="password" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} required />
          <Input
            label="Confirmar contraseña"
            icon={Lock}
            type="password"
            placeholder="Confirmar"
            value={confirmar}
            onChange={(e) => {
              setConfirmar(e.target.value);
              setErrores((prev) => ({ ...prev, confirmar: undefined }));
            }}
            error={errores.confirmar}
            required
          />
        </div>

        <Input label="Código estudiantil" name="codigoEstudiantil" value={form.codigoEstudiantil} onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo de documento" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} required>
            <option value="CEDULA">Cédula</option>
            <option value="TARJETA_DE_IDENTIDAD">Tarjeta de identidad</option>
            <option value="PASAPORTE">Pasaporte</option>
          </Select>
          <Input label="Número de documento" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <Input label="Programa académico" name="programaAcademico" value={form.programaAcademico} onChange={handleChange} required />
          <Input label="Semestre" name="semestre" type="number" min="1" value={form.semestre} onChange={handleChange} required />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:bg-primary/40 disabled:cursor-not-allowed"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-[11px] text-slate-500 mt-5">
        ¿Ya tiene una cuenta?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Inicie sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "../../auth/authStore";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";

function formatearTiempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, "0");
  const s = String(segundos % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [fallo, setFallo] = useState(false);
  const [intentos, setIntentos] = useState(null);
  const [bloqueoSeg, setBloqueoSeg] = useState(0);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const bloqueado = bloqueoSeg > 0;

  useEffect(() => {
    if (!bloqueado) return;
    const id = setInterval(() => setBloqueoSeg((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [bloqueado]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (bloqueado) return;
    setFallo(false);
    setLoading(true);
    try {
      await login(correo, contrasena);
      navigate("/cursos");
    } catch (err) {
      const data = err.response?.data;
      // Ajusta estos campos a lo que realmente devuelva tu backend
      if (err.response?.status === 423 || data?.bloqueado) {
        setBloqueoSeg(data?.segundosRestantes ?? 15 * 60);
      } else {
        setIntentos(data?.intentosRestantes ?? null);
        setFallo(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      panelTitle="Acceso a la plataforma"
      title="Iniciar sesión"
      subtitle="Ingrese sus credenciales para acceder a la plataforma."
    >
      {bloqueado && (
        <Alert variant="error" title="Cuenta bloqueada temporalmente" className="mb-5">
          Superó los intentos fallidos permitidos. Podrá volver a intentarlo en{" "}
          <strong>{formatearTiempo(bloqueoSeg)}</strong> minutos.
        </Alert>
      )}
      {fallo && !bloqueado && (
        <Alert variant="warning" title="Credenciales incorrectas" className="mb-5">
          Verifique su correo y contraseña.
          {intentos != null && ` Le quedan ${intentos} ${intentos === 1 ? "intento" : "intentos"}.`}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Correo electrónico"
          icon={Mail}
          type="email"
          placeholder="nombre@correo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          invalid={fallo && !bloqueado}
          required
        />
        <Input
          label="Contraseña"
          icon={Lock}
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading || bloqueado}
          className="w-full rounded-md bg-primary py-2.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:bg-primary/40 disabled:cursor-not-allowed"
        >
          {bloqueado ? "Acceso bloqueado" : loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-center text-[11px] text-slate-500 mt-5">
        ¿No tiene una cuenta?{" "}
        <Link to="/registro" className="font-semibold text-primary hover:underline">
          Regístrese
        </Link>
      </p>
    </AuthLayout>
  );
}
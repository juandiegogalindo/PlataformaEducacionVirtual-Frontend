import { GraduationCap } from "lucide-react";

export default function AuthLayout({ panelTitle, title, subtitle, ancho = "max-w-sm", children }) {
  return (
    <div className="min-h-screen grid md:grid-cols-[2fr_3fr] bg-white">
      <aside className="hidden md:flex md:sticky md:top-0 md:h-screen flex-col justify-between bg-sidebar text-white p-10">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary grid place-items-center">
            <GraduationCap size={16} />
          </span>
          <span className="font-semibold text-sm">Bit Criollo</span>
        </div>

        <div>
          <div className="w-10 h-0.5 bg-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">{panelTitle}</h2>
          <p className="text-xs text-slate-400 max-w-xs">
            Plataforma de Educación Virtual para la gestión de cursos, contenidos, evaluaciones y reportes académicos.
          </p>
        </div>

        <p className="text-[11px] text-slate-500">© 2026 Bit Criollo · Universidad Piloto de Colombia</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-10">
        <div className={`w-full ${ancho}`}>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-xs text-slate-500 mb-6">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
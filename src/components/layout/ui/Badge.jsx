const estilos = {
  success: "bg-green-100 text-green-700",
  danger:  "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info:    "bg-blue-100 text-blue-700",
  neutral: "bg-slate-100 text-slate-600",
};

export default function Badge({ variant = "neutral", children }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${estilos[variant]}`}>
      {children}
    </span>
  );
}
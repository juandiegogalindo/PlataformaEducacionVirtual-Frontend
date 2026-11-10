import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const estilos = {
  success: { box: "bg-green-50 border-green-200 text-green-800", icon: CheckCircle2 },
  warning: { box: "bg-amber-50 border-amber-200 text-amber-800", icon: AlertTriangle },
  error:   { box: "bg-red-50 border-red-200 text-red-800", icon: XCircle },
};

export default function Alert({ variant = "success", title, children, className = "" }) {
  const { box, icon: Icon } = estilos[variant];
  return (
    <div role="alert" className={`flex gap-2.5 border rounded-lg px-4 py-3 text-xs ${box} ${className}`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <p className="opacity-90">{children}</p>}
      </div>
    </div>
  );
}
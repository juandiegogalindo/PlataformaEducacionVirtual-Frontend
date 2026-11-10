function clasesCampo(conIcono, hayError) {
  return `w-full rounded-md border bg-white py-2 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-slate-50 ${
    conIcono ? "pl-9" : "pl-3"
  } ${hayError ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-primary"}`;
}

function Etiqueta({ label, required }) {
  if (!label) return null;
  return (
    <span className="block text-[11px] font-semibold mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
  );
}

export default function Input({ label, icon: Icon, error, invalid, required, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <Etiqueta label={label} required={required} />
      <span className="relative block">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input required={required} {...props} className={clasesCampo(!!Icon, !!error || invalid)} />
      </span>
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export function Select({ label, error, required, className = "", children, ...props }) {
  return (
    <label className={`block ${className}`}>
      <Etiqueta label={label} required={required} />
      <select required={required} {...props} className={clasesCampo(false, !!error)}>
        {children}
      </select>
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </label>
  );
}
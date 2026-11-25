export default function Section({ title, children, right }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground">{title}</h4>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Row({ label, value, mono = true, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between h-7 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono" : ""} text-foreground/90 ${valueClass}`}>{value}</span>
    </div>
  );
}
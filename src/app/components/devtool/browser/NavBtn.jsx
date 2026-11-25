// A navigation button inside the fake browser UI. The UI is decorative (pointer-events: none), but the
// back / forward / reload buttons really drive the page of THAT device.
export default function NavBtn({ onClick, title, style, className = "", children }) {
  if (!onClick) return <span className={className} style={style}>{children}</span>;
  return (
    <button
      type="button" title={title} aria-label={title} onClick={onClick}
      className={`${className} hover:bg-white/10`}
      style={{ ...style, pointerEvents: "auto", background: "transparent", border: 0, padding: 0, color: "inherit", cursor: "pointer", borderRadius: 8 }}
    >
      {children}
    </button>
  );
}

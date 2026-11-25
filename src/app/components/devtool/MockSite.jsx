import { cn } from "@/lib/utils";

export default function MockSite({ darkMode }) {
  const d = darkMode;
  const bg = d ? "bg-slate-950" : "bg-white";
  const text = d ? "text-slate-100" : "text-slate-900";
  const muted = d ? "text-slate-400" : "text-slate-500";
  const border = d ? "border-slate-800" : "border-slate-100";
  const card = d ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";
  const navLink = d ? "text-slate-300" : "text-slate-600";
  const btnGhost = d ? "border-slate-700 text-slate-200" : "border-slate-300 text-slate-700";

  const cards = [
    ["01", "Design Systems", "Tokens, components, and docs that scale across platforms."],
    ["02", "Performance", "Sub-second loads with edge rendering and image pipelines."],
    ["03", "Accessibility", "WCAG AA as a baseline, tested on real assistive tech."],
  ];

  return (
    <div className={cn("h-full w-full overflow-y-auto", bg, text)}>
      <header data-inspect="header" className={cn("flex items-center justify-between px-5 py-3 border-b", border)}>
        <div className="flex items-center gap-2 font-bold text-[13px]">
          <span className="w-4 h-4 rounded-[4px] bg-blue-600" /> Pixelworks
        </div>
        <nav data-inspect="nav" className="flex items-center gap-4 text-[11px]">
          <a data-inspect="a" className={navLink}>Work</a>
          <a data-inspect="a" className={navLink}>About</a>
          <a data-inspect="a" className={navLink}>Blog</a>
        </nav>
        <button data-inspect="button" className="text-[11px] font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white">
          Get Started
        </button>
      </header>

      <main data-inspect="main" className="px-5 py-6">
        <section data-inspect="section" className="text-center max-w-sm mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-widest text-blue-600">Responsive by design</p>
          <h1 data-inspect="h1" className="text-[22px] font-extrabold leading-tight mt-2">
            Interfaces that feel native on every screen
          </h1>
          <p data-inspect="p" className={cn("text-[12px] mt-2", muted)}>
            A design systems studio building fast, accessible products for the modern web.
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <button data-inspect="button" className="text-[11px] font-semibold px-3.5 py-2 rounded-md bg-blue-600 text-white">
              Start a project
            </button>
            <button data-inspect="button" className={cn("text-[11px] font-semibold px-3.5 py-2 rounded-md border", btnGhost)}>
              View work
            </button>
          </div>
        </section>

        <section data-inspect="section" className="mt-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5">
            {cards.map(([num, title, desc]) => (
              <article key={num} data-inspect="article" className={cn("rounded-lg border p-3", card)}>
                <span className="w-6 h-6 rounded bg-blue-600/15 text-blue-600 flex items-center justify-center font-mono text-[11px]">
                  {num}
                </span>
                <h3 className="text-[12px] font-semibold mt-2">{title}</h3>
                <p className={cn("text-[10px] mt-1", muted)}>{desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer data-inspect="footer" className={cn("px-5 py-3 border-t text-[10px]", muted, border)}>
        © 2026 Pixelworks Studio · hello@pixelworks.dev
      </footer>
    </div>
  );
}
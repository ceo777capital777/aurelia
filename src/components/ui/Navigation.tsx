"use client";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#amenities", label: "Amenities" },
  { href: "#location", label: "Location" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

export function Navigation({
  exploring,
  onBack,
}: {
  exploring: boolean;
  onBack: () => void;
}) {
  return (
    <header className="pointer-events-auto flex items-center justify-between px-4 py-4 md:px-8">
      <a href="#residence" className="flex items-center gap-3 text-white" onClick={exploring ? (event) => { event.preventDefault(); onBack(); } : undefined}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50">
          <span className="block h-4 w-px bg-gold" />
        </span>
        <span>
          <span className="block font-serif text-lg leading-none tracking-[0.22em]">AURELIA</span>
          <span className="mt-1 block text-[10px] tracking-[0.28em] text-muted">RESIDENCE</span>
        </span>
      </a>
      {exploring ? (
        <button type="button" onClick={onBack} className="rounded-full border border-white/15 px-4 py-2 text-[11px] tracking-[0.18em] text-white" data-testid="back-to-building">
          BACK TO BUILDING
        </button>
      ) : (
        <nav className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-muted md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

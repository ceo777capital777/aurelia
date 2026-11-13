"use client";

export function Loader({ progress = 0, label = "Preparing the residence" }: { progress?: number; label?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink" data-testid="loader">
      <div className="text-[11px] tracking-[0.42em] text-gold">AURELIA</div>
      <div className="mt-5 h-px w-40 overflow-hidden bg-white/10">
        <div className="h-full bg-gold transition-all duration-500" style={{ width: `${Math.max(12, Math.min(100, progress || 18))}%` }} />
      </div>
      <p className="mt-4 text-xs tracking-[0.22em] text-muted">{label}</p>
    </div>
  );
}

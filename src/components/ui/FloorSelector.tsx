"use client";

import { useEffect, useRef } from "react";
import { floorKind } from "@/data/building";

export function FloorSelector({
  open,
  floor,
  onSelect,
}: {
  open: boolean;
  floor: number | null;
  onSelect: (floor: number) => void;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [floor, open]);

  if (!open) return null;

  const floors = Array.from({ length: 35 }, (_, index) => 35 - index);

  return (
    <aside className="pointer-events-auto absolute bottom-24 left-3 top-24 z-20 w-[4.6rem] md:bottom-8 md:left-6 md:w-36" data-testid="floor-selector">
      <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 px-3 py-3 text-[10px] tracking-[0.22em] text-gold">FLOORS</div>
        <div className="flex-1 overflow-y-auto">
          {floors.map((value) => {
            const kind = floorKind(value);
            const active = floor === value;
            const note = kind === "amenity" ? "Amenity" : kind === "penthouse" ? "Sky" : "Residence";
            return (
              <button
                key={value}
                ref={active ? selectedRef : undefined}
                type="button"
                data-testid={`floor-button-${value}`}
                onClick={() => onSelect(value)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs ${active ? "bg-gold text-ink" : "text-white hover:bg-white/5"}`}
              >
                <span className="font-medium">{String(value).padStart(2, "0")}</span>
                <span className={`hidden text-[10px] uppercase tracking-wider md:inline ${active ? "text-ink/70" : "text-muted"}`}>{note}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

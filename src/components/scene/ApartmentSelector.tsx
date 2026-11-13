"use client";

import { Html } from "@react-three/drei";
import { apartmentsOnFloor, getApartmentZone, type Apartment } from "@/data/building";
import { formatArea } from "@/lib/format";

const STATUS_COLOR = {
  Available: "#C5A46D",
  Reserved: "#b8885a",
  Sold: "#8a8681",
};

export function ApartmentSelector({
  floor,
  apartments,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: {
  floor: number;
  apartments: Apartment[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const units = apartmentsOnFloor(apartments, floor);
  if (!units.length) return null;

  return (
    <group>
      {units.map((unit) => {
        const zone = getApartmentZone(unit.layout, floor);
        const active = unit.id === hoveredId || unit.id === selectedId;
        return (
          <mesh
            key={unit.id}
            position={zone.position}
            onPointerOver={(event) => {
              event.stopPropagation();
              onHover(unit.id);
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              onHover(null);
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(unit.id);
            }}
          >
            <boxGeometry args={zone.size} />
            <meshStandardMaterial
              color={STATUS_COLOR[unit.status]}
              transparent
              opacity={active ? 0.72 : 0.28}
              emissive={STATUS_COLOR[unit.status]}
              emissiveIntensity={active ? 0.35 : 0.05}
            />
            {active && (
              <Html position={[0, 0.4, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
                <div className="min-w-36 rounded-xl border border-white/10 bg-ink/90 px-3 py-2 text-white shadow-xl">
                  <div className="text-xs tracking-[0.16em] text-gold">{unit.number}</div>
                  <div className="mt-1 text-sm">{formatArea(unit.area)}</div>
                  <div className="text-xs text-muted">
                    {unit.bedrooms} bed · {unit.bathrooms} bath · {unit.status}
                  </div>
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
    </group>
  );
}

export function ApartmentList({
  apartments,
  floor,
  selectedId,
  onSelect,
}: {
  apartments: Apartment[];
  floor: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const units = apartmentsOnFloor(apartments, floor);
  if (!units.length) return null;
  return (
    <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto pb-1">
      {units.map((unit) => {
        const active = unit.id === selectedId;
        return (
          <button
            key={unit.id}
            type="button"
            data-testid={`apartment-chip-${unit.id}`}
            onClick={() => onSelect(unit.id)}
            className={`shrink-0 rounded-full border px-3 py-2 text-left text-xs tracking-wide transition ${
              active ? "border-gold bg-gold text-ink" : "border-white/15 bg-panel/80 text-white hover:border-gold/60"
            }`}
          >
            <span className="block font-medium">{unit.number}</span>
            <span className={`block ${active ? "text-ink/70" : "text-muted"}`}>{unit.status}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { Html } from "@react-three/drei";
import type { FloorKind } from "@/data/building";
import { openingPanels, wallRun, type BoxSpec } from "./planGeometry";

const WALL = "#f4f1ea";
const CORE = "#2a3038";
const STONE = "#e7e1d8";

function Solid({ items, color, metalness = 0.08, roughness = 0.62 }: { items: BoxSpec[]; color: string; metalness?: number; roughness?: number }) {
  return (
    <group>
      {items.map((item, index) => (
        <mesh key={`${item.position.join("-")}-${index}`} position={item.position} castShadow receiveShadow>
          <boxGeometry args={item.size} />
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}
    </group>
  );
}

function Glass({ items }: { items: BoxSpec[] }) {
  return (
    <group>
      {items.map((item, index) => (
        <mesh key={`g-${index}`} position={item.position}>
          <boxGeometry args={item.size} />
          <meshStandardMaterial color="#c5d5e2" transparent opacity={0.28} roughness={0.05} metalness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Door({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.96, 2.1, 0.06]} />
        <meshStandardMaterial color="#3a332c" roughness={0.55} />
      </mesh>
      <mesh position={[0.34, 1.0, 0.05]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Label({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Html position={position} center distanceFactor={22} style={{ pointerEvents: "none" }}>
      <div className="whitespace-nowrap rounded-full border border-gold/40 bg-ink/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gold">
        {text}
      </div>
    </Html>
  );
}

function ResidencePlan() {
  const height = 2.72;
  const northWindows: [number, number][] = [
    [-14.2, -10.5],
    [-8.8, -5.1],
    [-2.4, 1.5],
    [5.2, 8.7],
    [11.1, 14.3],
  ];
  const sideWindows: [number, number][] = [
    [-9.4, -6.3],
    [-3.1, 0.2],
    [3.6, 8.4],
  ];
  const walls = [
    ...wallRun({ axis: "x", fixed: -11, from: -16, to: 16, gaps: northWindows, height }),
    ...wallRun({ axis: "x", fixed: 11, from: -16, to: 16, gaps: northWindows, height }),
    ...wallRun({ axis: "z", fixed: -16, from: -11, to: 11, gaps: sideWindows, height }),
    ...wallRun({ axis: "z", fixed: 16, from: -11, to: 11, gaps: sideWindows, height }),
    ...wallRun({ axis: "x", fixed: -4.25, from: -15.7, to: -4.35, gaps: [[-9.5, -7.7]], height }),
    ...wallRun({ axis: "x", fixed: -4.25, from: 4.35, to: 15.7, gaps: [[7.6, 9.4]], height }),
    ...wallRun({ axis: "x", fixed: 4.25, from: -15.7, to: -4.35, gaps: [[-9.5, -7.7]], height }),
    ...wallRun({ axis: "x", fixed: 4.25, from: 4.35, to: 15.7, gaps: [[7.6, 9.4]], height }),
    ...wallRun({ axis: "z", fixed: -4.35, from: -10.8, to: -4.25, height }),
    ...wallRun({ axis: "z", fixed: 4.35, from: -10.8, to: -4.25, height }),
    ...wallRun({ axis: "z", fixed: -4.35, from: 4.25, to: 10.8, height }),
    ...wallRun({ axis: "z", fixed: 4.35, from: 4.25, to: 10.8, height }),
  ];
  const windows = [
    ...openingPanels({ axis: "x", fixed: -11, gaps: northWindows, height: 1.7, y: 1.45 }),
    ...openingPanels({ axis: "x", fixed: 11, gaps: northWindows, height: 1.7, y: 1.45 }),
    ...openingPanels({ axis: "z", fixed: -16, gaps: sideWindows, height: 1.7, y: 1.45 }),
    ...openingPanels({ axis: "z", fixed: 16, gaps: sideWindows, height: 1.7, y: 1.45 }),
  ];

  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[32.4, 0.16, 22.4]} />
        <meshStandardMaterial color={STONE} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[8.8, 0.04, 8.6]} />
        <meshStandardMaterial color="#d9d2c7" roughness={0.6} />
      </mesh>
      <Solid items={walls} color={WALL} />
      <Glass items={windows} />
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[4.4, height, 4.6]} />
        <meshStandardMaterial color={CORE} metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.05, 2.32]}>
        <boxGeometry args={[1.5, 2.05, 0.06]} />
        <meshStandardMaterial color="#0e1014" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.05, -2.32]}>
        <boxGeometry args={[1.5, 2.05, 0.06]} />
        <meshStandardMaterial color="#0e1014" metalness={0.7} roughness={0.25} />
      </mesh>
      {Array.from({ length: 12 }, (_, step) => (
        <mesh key={step} position={[-3.55, 0.08 + step * 0.18, -1.45 + step * 0.24]} castShadow>
          <boxGeometry args={[1.55, 0.1, 0.24]} />
          <meshStandardMaterial color="#ddd6cc" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-3.55, 1.15, 1.55]}>
        <boxGeometry args={[0.05, 1.0, 1.6]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.7} roughness={0.3} />
      </mesh>
      <Door position={[-8.6, 0, -4.25]} />
      <Door position={[8.5, 0, -4.25]} />
      <Door position={[8.5, 0, 4.25]} rotation={Math.PI} />
      <Door position={[-8.6, 0, 4.25]} rotation={Math.PI} />
      <Label position={[0, 2.2, 0]} text="Lifts" />
    </group>
  );
}

function PenthousePlan() {
  const height = 2.85;
  const windows: [number, number][] = [
    [-13.5, -8.2],
    [-6.4, -1.6],
    [1.6, 6.4],
    [8.2, 13.5],
  ];
  const walls = [
    ...wallRun({ axis: "x", fixed: -11, from: -16, to: 16, gaps: windows, height }),
    ...wallRun({ axis: "x", fixed: 11, from: -16, to: 16, gaps: windows, height }),
    ...wallRun({ axis: "z", fixed: -16, from: -11, to: 11, gaps: [[-8, -2], [2, 8]], height }),
    ...wallRun({ axis: "z", fixed: 16, from: -11, to: 11, gaps: [[-8, -2], [2, 8]], height }),
    ...wallRun({ axis: "z", fixed: -1.35, from: -10.6, to: 10.6, gaps: [[-1.1, 1.1]], height }),
    ...wallRun({ axis: "z", fixed: 1.35, from: -10.6, to: 10.6, gaps: [[-1.1, 1.1]], height }),
  ];
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[32.6, 0.16, 22.5]} />
        <meshStandardMaterial color={STONE} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, -12.4]} receiveShadow>
        <boxGeometry args={[28, 0.08, 2.6]} />
        <meshStandardMaterial color="#c8b69a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.7, -13.55]}>
        <boxGeometry args={[28, 0.08, 0.08]} />
        <meshStandardMaterial color="#d5dee6" transparent opacity={0.45} />
      </mesh>
      <Solid items={walls} color={WALL} />
      <Glass items={openingPanels({ axis: "x", fixed: -11, gaps: windows, height: 1.8, y: 1.5 })} />
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[2.5, height, 3.2]} />
        <meshStandardMaterial color={CORE} metalness={0.4} roughness={0.35} />
      </mesh>
      <Door position={[-1.35, 0, 0]} rotation={Math.PI / 2} />
      <Door position={[1.35, 0, 0]} rotation={-Math.PI / 2} />
      <Label position={[-8, 1.6, -12.2]} text="Sky terrace" />
    </group>
  );
}

function LobbyPlan() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[32.4, 0.16, 22.4]} />
        <meshStandardMaterial color="#ddd6cb" roughness={0.45} />
      </mesh>
      <Solid
        items={[
          ...wallRun({ axis: "x", fixed: -11, from: -16, to: 16, gaps: [[-12, 12]], height: 3.3 }),
          ...wallRun({ axis: "x", fixed: 11, from: -16, to: 16, gaps: [[-4, 4]], height: 3.3 }),
          ...wallRun({ axis: "z", fixed: -16, from: -11, to: 11, gaps: [[-6, 6]], height: 3.3 }),
          ...wallRun({ axis: "z", fixed: 16, from: -11, to: 11, gaps: [[-6, 6]], height: 3.3 }),
        ]}
        color="#f7f4ee"
      />
      <Glass items={openingPanels({ axis: "x", fixed: 11, gaps: [[-4, 4]], height: 2.6, y: 1.5 })} />
      <mesh position={[0, 0.55, -1.2]} castShadow>
        <boxGeometry args={[3.4, 1.05, 1.15]} />
        <meshStandardMaterial color="#2b3036" metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.12, -1.2]}>
        <boxGeometry args={[3.5, 0.08, 1.25]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.65} roughness={0.3} />
      </mesh>
      {[-6.5, 6.5].map((x) => (
        <group key={x} position={[x, 0, 3]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[1.8, 0.4, 0.7]} />
            <meshStandardMaterial color="#3e4652" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 1.1]}>
            <boxGeometry args={[0.7, 0.4, 0.7]} />
            <meshStandardMaterial color="#d9d3c8" roughness={0.45} />
          </mesh>
        </group>
      ))}
      {[-8, 8].map((x) => (
        <mesh key={`col-${x}`} position={[x, 1.6, -6]} castShadow>
          <cylinderGeometry args={[0.28, 0.32, 3.2, 16]} />
          <meshStandardMaterial color="#ece7df" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.7, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.03, 8, 24]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.8} roughness={0.25} emissive="#C5A46D" emissiveIntensity={0.25} />
      </mesh>
      <pointLight position={[0, 2.4, 2]} intensity={2.2} distance={14} color="#ffe1b8" />
      <Label position={[0, 2.1, -1.2]} text="Grand lobby" />
    </group>
  );
}

function PodiumPlan() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[32.4, 0.16, 22.4]} />
        <meshStandardMaterial color="#d8d2c8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.08, -2]} receiveShadow>
        <boxGeometry args={[10, 0.18, 4.2]} />
        <meshStandardMaterial color="#1f7388" metalness={0.15} roughness={0.08} />
      </mesh>
      {[-3.2, -1.6, 0, 1.6, 3.2].map((x) => (
        <mesh key={x} position={[x, 0.28, 4.2]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.55, 0.08, 1.3]} />
          <meshStandardMaterial color="#f4efe8" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[10.5, 1.3, 0]}>
        <boxGeometry args={[6.5, 2.5, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.16} />
      </mesh>
      <mesh position={[-10.2, 0.4, 1]}>
        <boxGeometry args={[5.5, 0.08, 5.5]} />
        <meshStandardMaterial color="#efeae3" />
      </mesh>
      {[-1.2, 0, 1.2].map((z) => (
        <mesh key={z} position={[-10.2, 0.75, z]}>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 16]} />
          <meshStandardMaterial color="#2c333b" />
        </mesh>
      ))}
      <mesh position={[0, 1.2, -8.2]}>
        <boxGeometry args={[8, 2.3, 3.2]} />
        <meshStandardMaterial color="#f7f3ec" roughness={0.5} />
      </mesh>
      <Label position={[0, 1.4, -2]} text="Pool" />
      <Label position={[10.5, 1.8, 0]} text="Fitness" />
      <Label position={[-10.2, 1.3, 1]} text="Restaurant" />
      <Label position={[0, 1.8, -8.2]} text="Spa" />
    </group>
  );
}

export function FloorScene({ floor, kind }: { floor: number; kind: FloorKind }) {
  if (kind === "amenity") return floor === 1 ? <LobbyPlan /> : <PodiumPlan />;
  if (kind === "penthouse") return <PenthousePlan />;
  return <ResidencePlan />;
}

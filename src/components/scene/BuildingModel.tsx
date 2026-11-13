"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { getFloorSpecs, type Apartment, type FloorSpec } from "@/data/building";
import { extrudeRounded, samplePerimeter } from "./geometry";
import { makeFacadeTextures } from "./textures";
import { FloorScene } from "./FloorScene";
import { ApartmentSelector } from "./ApartmentSelector";
import type { Quality, TimeOfDay } from "./types";

const PODIUM_SHIFT = 4;

function useSharedGeometry() {
  const geometries = useMemo(() => {
    const map = new Map<string, THREE.BufferGeometry>();
    const get = (width: number, depth: number, radius: number, height: number) => {
      const key = `${width}|${depth}|${radius}|${height}`;
      const existing = map.get(key);
      if (existing) return existing;
      const geometry = extrudeRounded(width, depth, radius, height);
      map.set(key, geometry);
      return geometry;
    };
    return {
      get,
      dispose() {
        map.forEach((geometry) => geometry.dispose());
      },
    };
  }, []);
  useEffect(() => () => geometries.dispose(), [geometries]);
  return geometries;
}

function FacadeFins({ quality }: { quality: Quality }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const specs = getFloorSpecs();
  const capacity = 700;

  useEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const dummy = new THREE.Object3D();
    const outward = new THREE.Vector3();
    const spacing = quality === "low" ? 2.8 : 1.65;
    let index = 0;
    const tiers = new Map<string, { spec: FloorSpec; fromY: number; toY: number }>();
    for (const spec of specs) {
      if (spec.kind === "amenity") continue;
      const key = `${spec.width}|${spec.depth}`;
      const tier = tiers.get(key);
      const top = spec.baseY + spec.height;
      if (!tier) tiers.set(key, { spec, fromY: spec.baseY, toY: top });
      else tier.toY = top;
    }
    tiers.forEach((tier) => {
      const points = samplePerimeter(tier.spec.width + 0.35, tier.spec.depth + 0.35, tier.spec.radius, spacing);
      const height = tier.toY - tier.fromY;
      for (const point of points) {
        if (index >= capacity) break;
        dummy.position.set(point.x, tier.fromY + height / 2, point.z);
        dummy.scale.set(1, height, 1);
        outward.set(point.nx, 0, point.nz).normalize();
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward);
        dummy.updateMatrix();
        target.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    });
    target.count = index;
    target.instanceMatrix.needsUpdate = true;
  }, [quality, specs]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, capacity]}>
      <boxGeometry args={[0.07, 1, 0.42]} />
      <meshStandardMaterial color="#1b2128" metalness={0.82} roughness={0.28} />
    </instancedMesh>
  );
}

function FloorBand({
  spec,
  geometry,
  spandrel,
  facade,
  hovered,
  selected,
  ghost,
  time,
  interactive,
  apartments,
  hoveredApt,
  selectedApt,
  onHoverFloor,
  onSelectFloor,
  onHoverApt,
  onSelectApt,
}: {
  spec: FloorSpec;
  geometry: THREE.BufferGeometry;
  spandrel: THREE.BufferGeometry;
  facade: { map: THREE.Texture; emissive: THREE.Texture } | null;
  hovered: boolean;
  selected: boolean;
  ghost: boolean;
  time: TimeOfDay;
  interactive: boolean;
  apartments: Apartment[];
  hoveredApt: string | null;
  selectedApt: string | null;
  onHoverFloor: (floor: number | null) => void;
  onSelectFloor: (floor: number) => void;
  onHoverApt: (id: string | null) => void;
  onSelectApt: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: spec.kind === "amenity" ? "#2c2b28" : "#8eacbf",
        metalness: spec.kind === "amenity" ? 0.42 : 0.86,
        roughness: spec.kind === "amenity" ? 0.48 : 0.12,
        transparent: true,
        opacity: spec.kind === "amenity" ? 1 : 0.78,
        envMapIntensity: 1.15,
      }),
    [spec.kind],
  );
  const windows = useMemo(() => {
    if (!facade) return null;
    return new THREE.MeshStandardMaterial({
      map: facade.map,
      emissiveMap: facade.emissive,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0.16,
      roughness: 0.32,
      metalness: 0.42,
      envMapIntensity: 0.7,
      transparent: true,
      opacity: 1,
    });
  }, [facade]);
  const band = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#14181d",
        metalness: 0.62,
        roughness: 0.38,
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  useEffect(() => {
    const fade = ghost && !selected;
    shell.depthWrite = !selected && !fade;
    shell.opacity = selected ? 0 : fade ? 0.045 : spec.kind === "amenity" ? 1 : 0.88;
    shell.color.set(hovered && !selected ? "#e7d3ae" : fade ? "#101318" : spec.kind === "amenity" ? "#2c2b28" : "#8eacbf");
    shell.emissive.set(hovered ? "#C5A46D" : "#000000");
    shell.emissiveIntensity = hovered ? 0.2 : 0;
    band.opacity = fade ? 0.05 : 1;
    band.depthWrite = !fade;
    if (windows) {
      windows.depthWrite = !selected && !fade;
      windows.opacity = selected || fade ? 0 : 1;
      windows.emissive.set(hovered ? "#C5A46D" : "#ffffff");
      windows.emissiveIntensity = hovered ? 0.65 : time === "evening" ? 1.25 : 0.22;
    }
  }, [band, ghost, hovered, selected, shell, spec.kind, time, windows]);

  useEffect(
    () => () => {
      shell.dispose();
      windows?.dispose();
      band.dispose();
    },
    [band, shell, windows],
  );

  useFrame(() => {
    const current = group.current;
    if (!current) return;
    const base = spec.kind === "amenity" ? PODIUM_SHIFT : 0;
    const goal = selected ? base + 22 : base;
    current.position.z += (goal - current.position.z) * 0.08;
  });

  const faceW = Math.max(2, spec.width - spec.radius * 2.4);
  const faceD = Math.max(2, spec.depth - spec.radius * 2.4);
  const faceH = spec.height * 0.62;
  const faceY = spec.height * 0.56;

  return (
    <group ref={group} position={[0, spec.baseY, spec.kind === "amenity" ? PODIUM_SHIFT : 0]}>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} material={shell} castShadow receiveShadow />
      <mesh geometry={spandrel} rotation={[-Math.PI / 2, 0, 0]} material={band} position={[0, 0.02, 0]} />
      {spec.kind === "amenity" && (
        <mesh position={[0, spec.height * 0.55, spec.depth / 2 + 0.07]}>
          <planeGeometry args={[spec.width * 0.78, spec.height * 0.66]} />
          <meshStandardMaterial
            color="#d7e6f1"
            metalness={0.62}
            roughness={0.08}
            transparent
            opacity={ghost && !selected ? 0.05 : 0.5}
            emissive="#ffb57a"
            emissiveIntensity={time === "evening" ? 0.4 : 0.05}
          />
        </mesh>
      )}
      {windows && (
        <group>
          <mesh position={[0, faceY, spec.depth / 2 + 0.08]} material={windows}>
            <planeGeometry args={[faceW, faceH]} />
          </mesh>
          <mesh position={[0, faceY, -spec.depth / 2 - 0.08]} rotation={[0, Math.PI, 0]} material={windows}>
            <planeGeometry args={[faceW, faceH]} />
          </mesh>
          <mesh position={[spec.width / 2 + 0.08, faceY, 0]} rotation={[0, Math.PI / 2, 0]} material={windows}>
            <planeGeometry args={[faceD, faceH]} />
          </mesh>
          <mesh position={[-spec.width / 2 - 0.08, faceY, 0]} rotation={[0, -Math.PI / 2, 0]} material={windows}>
            <planeGeometry args={[faceD, faceH]} />
          </mesh>
        </group>
      )}
      {interactive && !selected && (
        <mesh
          position={[0, spec.height / 2, 0]}
          onPointerDown={(event) => {
            pointer.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            onHoverFloor(spec.floor);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            onHoverFloor(null);
            document.body.style.cursor = "";
          }}
          onClick={(event) => {
            const dx = event.clientX - pointer.current.x;
            const dy = event.clientY - pointer.current.y;
            if (dx * dx + dy * dy > 25) return;
            event.stopPropagation();
            onSelectFloor(spec.floor);
          }}
        >
          <boxGeometry args={[spec.width + 0.6, spec.height, spec.depth + 0.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {hovered && !selected && (
        <Html position={[0, spec.height + 0.4, spec.depth / 2]} center style={{ pointerEvents: "none" }}>
          <div className="rounded-full border border-gold/50 bg-ink/85 px-3 py-1 text-[11px] tracking-[0.22em] text-gold">
            FLOOR {String(spec.floor).padStart(2, "0")}
          </div>
        </Html>
      )}
      {selected && (
        <group position={[0, 0.2, 0]}>
          <FloorScene floor={spec.floor} kind={spec.kind} />
          <ApartmentSelector
            floor={spec.floor}
            apartments={apartments}
            hoveredId={hoveredApt}
            selectedId={selectedApt}
            onHover={onHoverApt}
            onSelect={onSelectApt}
          />
        </group>
      )}
    </group>
  );
}

function Palm({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 2.6, 7]} />
        <meshStandardMaterial color="#6a5438" roughness={0.85} />
      </mesh>
      {[0, 1.1, 2.2, 3.3, 4.4].map((angle) => (
        <mesh key={angle} position={[Math.cos(angle) * 0.55, 2.55, Math.sin(angle) * 0.55]} rotation={[0.7, -angle, 0]}>
          <coneGeometry args={[0.18, 1.35, 5]} />
          <meshStandardMaterial color="#1f6b45" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function PodiumLife({ topY }: { topY: number }) {
  return (
    <group position={[0, topY, PODIUM_SHIFT]}>
      <mesh position={[0, 0.18, 15.2]} receiveShadow>
        <boxGeometry args={[16, 0.28, 6.2]} />
        <meshStandardMaterial color="#1a7490" metalness={0.12} roughness={0.06} />
      </mesh>
      <mesh position={[0, 0.34, 15.2]}>
        <boxGeometry args={[14.2, 0.04, 4.6]} />
        <meshStandardMaterial color="#d8f4ff" transparent opacity={0.35} roughness={0.05} />
      </mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 0.32, 11.2]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.08, 1.5]} />
          <meshStandardMaterial color="#f6f1e8" roughness={0.65} />
        </mesh>
      ))}
      <Palm position={[-18, 0, 12]} />
      <Palm position={[18, 0, 12]} />
      <Palm position={[-20, 0, 4]} />
      <Palm position={[20, 0, 4]} />
      <Palm position={[-12, 0, 18]} />
      <Palm position={[12, 0, 18]} />
      <mesh position={[0, 1.15, 20.5]} castShadow>
        <boxGeometry args={[14, 0.12, 2.4]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.72} roughness={0.28} />
      </mesh>
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 0.55, 20.5]} castShadow>
          <boxGeometry args={[0.16, 1.1, 0.16]} />
          <meshStandardMaterial color="#1a1d22" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, 18.2]}>
        <planeGeometry args={[6.5, 1.1]} />
        <meshBasicMaterial color="#f4efe6" />
      </mesh>
    </group>
  );
}

function nameTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  if (!g) return null;
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = "#f7f4ef";
  g.font = "500 64px Times New Roman, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("AURELIA", 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Crown({ y }: { y: number }) {
  const sign = useMemo(() => nameTexture(), []);
  useEffect(() => () => sign?.dispose(), [sign]);
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[10, 2.6, 8]} />
        <meshStandardMaterial color="#d5e2ec" metalness={0.8} roughness={0.12} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 3.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.2, 0.08, 8, 40]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.85} roughness={0.22} emissive="#C5A46D" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 4.6, 0]}>
        <cylinderGeometry args={[0.08, 0.16, 3.2, 8]} />
        <meshStandardMaterial color="#eceff3" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 6.3, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#ff4d4d" emissive="#ff2a2a" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[0, 3.2, 0]} intensity={4} distance={18} color="#C5A46D" />
      {sign && (
        <mesh position={[0, 1.5, 4.05]}>
          <planeGeometry args={[6.2, 1.4]} />
          <meshBasicMaterial map={sign} transparent />
        </mesh>
      )}
    </group>
  );
}

function SetbackRails() {
  const specs = getFloorSpecs();
  const joints = [18, 29, 32]
    .map((floor) => specs.find((item) => item.floor === floor))
    .filter((item): item is FloorSpec => Boolean(item));
  return (
    <group>
      {joints.map((spec) => {
        const y = spec.baseY + spec.height;
        return (
          <group key={spec.floor} position={[0, y, 0]}>
            {[
              [0, 0.55, spec.depth / 2 + 0.2, spec.width, 0.08, 0.08],
              [0, 0.55, -spec.depth / 2 - 0.2, spec.width, 0.08, 0.08],
              [spec.width / 2 + 0.2, 0.55, 0, 0.08, 0.08, spec.depth],
              [-spec.width / 2 - 0.2, 0.55, 0, 0.08, 0.08, spec.depth],
            ].map((item, index) => (
              <mesh key={index} position={[item[0], item[1], item[2]]}>
                <boxGeometry args={[item[3], item[4], item[5]]} />
                <meshStandardMaterial color="#d9e3ec" transparent opacity={0.4} />
              </mesh>
            ))}
            <mesh position={[spec.width / 2 - 1.2, 0.35, spec.depth / 2 - 1.1]}>
              <sphereGeometry args={[0.45, 10, 10]} />
              <meshStandardMaterial color="#2f6a4a" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function BuildingModel({
  apartments,
  hoveredFloor,
  selectedFloor,
  ghost,
  time,
  quality,
  interactive,
  hoveredApt,
  selectedApt,
  onHoverFloor,
  onSelectFloor,
  onHoverApt,
  onSelectApt,
}: {
  apartments: Apartment[];
  hoveredFloor: number | null;
  selectedFloor: number | null;
  ghost: boolean;
  time: TimeOfDay;
  quality: Quality;
  interactive: boolean;
  hoveredApt: string | null;
  selectedApt: string | null;
  onHoverFloor: (floor: number | null) => void;
  onSelectFloor: (floor: number) => void;
  onHoverApt: (id: string | null) => void;
  onSelectApt: (id: string) => void;
}) {
  const specs = getFloorSpecs();
  const geometries = useSharedGeometry();
  const facades = useMemo(() => {
    const map = new Map<number, { map: THREE.Texture; emissive: THREE.Texture }>();
    for (const spec of specs) {
      if (spec.kind === "amenity" || map.has(spec.width)) continue;
      const textures = makeFacadeTextures();
      const repeat = Math.max(2, spec.width / 6.4);
      textures.map.repeat.set(repeat, 1);
      textures.emissive.repeat.set(repeat, 1);
      map.set(spec.width, textures);
    }
    return map;
  }, [specs]);

  useEffect(
    () => () => {
      facades.forEach((textures) => {
        textures.map.dispose();
        textures.emissive.dispose();
      });
    },
    [facades],
  );

  const podiumTop = specs[1].baseY + specs[1].height;
  const towerTop = specs[specs.length - 1].baseY + specs[specs.length - 1].height;

  return (
    <group>
      <mesh position={[0, -0.35, PODIUM_SHIFT]} receiveShadow>
        <boxGeometry args={[56, 0.7, 42]} />
        <meshStandardMaterial color="#17191d" metalness={0.3} roughness={0.7} />
      </mesh>
      {specs.map((spec) => (
        <FloorBand
          key={spec.floor}
          spec={spec}
          geometry={geometries.get(spec.width, spec.depth, spec.radius, spec.height)}
          spandrel={geometries.get(spec.width + 0.25, spec.depth + 0.25, spec.radius, 0.28)}
          facade={spec.kind === "amenity" ? null : (facades.get(spec.width) ?? null)}
          hovered={hoveredFloor === spec.floor}
          selected={selectedFloor === spec.floor}
          ghost={ghost}
          time={time}
          interactive={interactive}
          apartments={apartments}
          hoveredApt={hoveredApt}
          selectedApt={selectedApt}
          onHoverFloor={onHoverFloor}
          onSelectFloor={onSelectFloor}
          onHoverApt={onHoverApt}
          onSelectApt={onSelectApt}
        />
      ))}
      {!ghost && <FacadeFins quality={quality} />}
      {!ghost && <PodiumLife topY={podiumTop} />}
      {!ghost && <SetbackRails />}
      {!ghost && <Crown y={towerTop} />}
    </group>
  );
}

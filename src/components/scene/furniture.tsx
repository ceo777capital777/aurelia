"use client";

import { useMemo } from "react";
import { makeArtTexture, makeRugTexture, makeWoodTexture } from "./textures";
import type { Piece } from "./interiorLayout";

const GOLD = "#C5A46D";
const FABRIC = "#3c4450";
const STONE = "#d9d3c8";
const WOOD = "#6b4e38";
const METAL = "#c5ccd4";

function Legs({ y = 0.16, points }: { y?: number; points: [number, number][] }) {
  return (
    <>
      {points.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y / 2, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.025, y, 8]} />
          <meshStandardMaterial color={GOLD} metalness={0.82} roughness={0.28} />
        </mesh>
      ))}
    </>
  );
}

function Sofa() {
  return (
    <group>
      <mesh position={[0, 0.32, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[2.25, 0.28, 0.82]} />
        <meshStandardMaterial color={FABRIC} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.62, -0.32]} castShadow>
        <boxGeometry args={[2.25, 0.48, 0.18]} />
        <meshStandardMaterial color={FABRIC} roughness={0.86} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0.48, 0.02]} castShadow>
          <boxGeometry args={[0.16, 0.42, 0.82]} />
          <meshStandardMaterial color="#2a313a" roughness={0.8} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`c-${x}`} position={[x, 0.5, 0.06]} castShadow>
          <boxGeometry args={[0.92, 0.14, 0.62]} />
          <meshStandardMaterial color="#4e5866" roughness={0.9} />
        </mesh>
      ))}
      <Legs y={0.18} points={[[-0.95, 0.28], [0.95, 0.28], [-0.95, -0.28], [0.95, -0.28]]} />
    </group>
  );
}

function CoffeeTable() {
  return (
    <group>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.05, 0.58]} />
        <meshStandardMaterial color={STONE} roughness={0.35} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.72, 0.28, 0.36]} />
        <meshStandardMaterial color="#1c2128" roughness={0.45} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Dining() {
  return (
    <group>
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[0.82, 0.05, 1.4]} />
        <meshStandardMaterial color="#efeae3" roughness={0.4} />
      </mesh>
      <Legs y={0.72} points={[[-0.3, -0.55], [0.3, -0.55], [-0.3, 0.55], [0.3, 0.55]]} />
      {[-0.45, 0.45].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.46, 0]} castShadow>
            <boxGeometry args={[0.42, 0.05, 0.42]} />
            <meshStandardMaterial color={WOOD} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.7, -0.16]}>
            <boxGeometry args={[0.42, 0.42, 0.06]} />
            <meshStandardMaterial color={FABRIC} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Kitchen() {
  return (
    <group>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[5.05, 0.84, 0.58]} />
        <meshStandardMaterial color="#23282f" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[5.1, 0.06, 0.64]} />
        <meshStandardMaterial color={STONE} roughness={0.32} />
      </mesh>
      <mesh position={[0, 1.85, -0.18]}>
        <boxGeometry args={[4.2, 0.7, 0.28]} />
        <meshStandardMaterial color="#2e343c" roughness={0.5} />
      </mesh>
      <mesh position={[-1.7, 0.92, 0.08]}>
        <boxGeometry args={[0.7, 0.02, 0.38]} />
        <meshStandardMaterial color="#111418" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[1.9, 1.15, 0]}>
        <boxGeometry args={[0.78, 1.7, 0.58]} />
        <meshStandardMaterial color={METAL} metalness={0.78} roughness={0.22} />
      </mesh>
    </group>
  );
}

function Island() {
  return (
    <group>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.68, 0.84, 1.4]} />
        <meshStandardMaterial color="#1b1f25" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.78, 0.06, 1.5]} />
        <meshStandardMaterial color="#f3efe8" roughness={0.28} />
      </mesh>
    </group>
  );
}

function Stool() {
  return (
    <group>
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 16]} />
        <meshStandardMaterial color={WOOD} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.62, 8]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Bed() {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.28, 2.1]} />
        <meshStandardMaterial color="#f7f4ef" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.72, 0.96]} castShadow>
        <boxGeometry args={[1.7, 0.7, 0.1]} />
        <meshStandardMaterial color="#2c333c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.78, 0.9]}>
        <boxGeometry args={[1.15, 0.08, 0.08]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.4, 0.5, 0.72]} castShadow>
        <boxGeometry args={[0.48, 0.16, 0.32]} />
        <meshStandardMaterial color="#fbfaf7" roughness={0.85} />
      </mesh>
      <mesh position={[0.4, 0.5, 0.72]} castShadow>
        <boxGeometry args={[0.48, 0.16, 0.32]} />
        <meshStandardMaterial color="#fbfaf7" roughness={0.85} />
      </mesh>
      <mesh position={[-0.95, 0.28, 0.78]}>
        <boxGeometry args={[0.32, 0.28, 0.32]} />
        <meshStandardMaterial color="#1c2128" roughness={0.45} />
      </mesh>
      <mesh position={[0.95, 0.28, 0.78]}>
        <boxGeometry args={[0.32, 0.28, 0.32]} />
        <meshStandardMaterial color="#1c2128" roughness={0.45} />
      </mesh>
      <mesh position={[-0.95, 0.48, 0.78]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 10]} />
        <meshStandardMaterial color="#fff2d8" emissive="#ffb56a" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.95, 0.48, 0.78]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 10]} />
        <meshStandardMaterial color="#fff2d8" emissive="#ffb56a" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function Wardrobe() {
  return (
    <mesh position={[0, 1.05, 0]} castShadow>
      <boxGeometry args={[0.42, 2.1, 1.4]} />
      <meshStandardMaterial color="#2a241f" roughness={0.55} />
    </mesh>
  );
}

function MediaWall() {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.38, 0.48, 1.65]} />
        <meshStandardMaterial color="#171b20" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.06, 0.82, 1.35]} />
        <meshStandardMaterial color="#050608" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, 0.02]}>
        <boxGeometry args={[0.02, 0.7, 1.2]} />
        <meshStandardMaterial color="#1d242e" emissive="#8fb4d6" emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

function Plant() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.14, 0.28, 12]} />
        <meshStandardMaterial color="#2b3036" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color="#2f6a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.72, 0.05]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#3d7d58" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Lamp() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.04, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.3, 8]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[0.16, 0.22, 12, 1, true]} />
        <meshStandardMaterial color="#f4efe4" emissive="#ffd7a8" emissiveIntensity={0.45} side={2} />
      </mesh>
      <pointLight position={[0, 1.2, 0]} intensity={0.6} distance={4.5} color="#ffd8b0" />
    </group>
  );
}

function Vanity() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.15, 0.72, 0.42]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[1.18, 0.05, 0.46]} />
        <meshStandardMaterial color={STONE} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.35, -0.18]}>
        <boxGeometry args={[0.9, 0.7, 0.04]} />
        <meshStandardMaterial color="#e7eef5" metalness={0.85} roughness={0.08} />
      </mesh>
    </group>
  );
}

function Toilet() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.38, 0.36, 0.52]} />
        <meshStandardMaterial color="#f7f7f5" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.48, -0.18]}>
        <boxGeometry args={[0.38, 0.28, 0.16]} />
        <meshStandardMaterial color="#f7f7f5" roughness={0.35} />
      </mesh>
    </group>
  );
}

function Shower() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.9, 0.04, 0.9]} />
        <meshStandardMaterial color="#cfd6dc" roughness={0.25} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.9, 2.0, 0.04]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.18} roughness={0.05} />
      </mesh>
      <mesh position={[0.28, 1.7, -0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Lounger() {
  return (
    <group>
      <mesh position={[0, 0.28, 0.15]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.62, 0.08, 1.35]} />
        <meshStandardMaterial color="#f3efe8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.48, 0.7]} rotation={[-0.7, 0, 0]}>
        <boxGeometry args={[0.62, 0.08, 0.4]} />
        <meshStandardMaterial color={FABRIC} roughness={0.75} />
      </mesh>
      <Legs y={0.2} points={[[-0.24, -0.45], [0.24, -0.45], [-0.24, 0.5], [0.24, 0.5]]} />
    </group>
  );
}

function Desk() {
  return (
    <group>
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.25, 0.05, 0.58]} />
        <meshStandardMaterial color="#efeae2" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[1.1, 0.64, 0.42]} />
        <meshStandardMaterial color="#2a3038" roughness={0.55} />
      </mesh>
    </group>
  );
}

export function FurnitureSet({ pieces }: { pieces: Piece[] }) {
  const rug = useMemo(() => makeRugTexture(), []);
  const art = useMemo(() => makeArtTexture(), []);
  const wood = useMemo(() => makeWoodTexture(), []);

  return (
    <group>
      {pieces.map((piece, index) => {
        const rotation = piece.rotation ?? 0;
        const key = `${piece.kind}-${index}`;
        return (
          <group key={key} position={piece.position} rotation={[0, rotation, 0]}>
            {piece.kind === "sofa" && <Sofa />}
            {piece.kind === "table" && <CoffeeTable />}
            {piece.kind === "dining" && <Dining />}
            {piece.kind === "kitchen" && <Kitchen />}
            {piece.kind === "island" && <Island />}
            {piece.kind === "stool" && <Stool />}
            {piece.kind === "bed" && <Bed />}
            {piece.kind === "wardrobe" && <Wardrobe />}
            {piece.kind === "media" && <MediaWall />}
            {piece.kind === "plant" && <Plant />}
            {piece.kind === "lamp" && <Lamp />}
            {piece.kind === "vanity" && <Vanity />}
            {piece.kind === "toilet" && <Toilet />}
            {piece.kind === "shower" && <Shower />}
            {piece.kind === "lounger" && <Lounger />}
            {piece.kind === "desk" && <Desk />}
            {piece.kind === "rug" && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[3.3, 2.15]} />
                <meshStandardMaterial map={rug} roughness={0.95} />
              </mesh>
            )}
            {piece.kind === "art" && (
              <mesh>
                <planeGeometry args={[0.7, 0.9]} />
                <meshStandardMaterial map={art} roughness={0.6} />
              </mesh>
            )}
          </group>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.2, 0.02, -9.6]} receiveShadow>
        <planeGeometry args={[5.6, 4.4]} />
        <meshStandardMaterial map={wood} roughness={0.72} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.02, -10.2]} receiveShadow>
        <planeGeometry args={[5.8, 3.6]} />
        <meshStandardMaterial map={wood} roughness={0.72} />
      </mesh>
    </group>
  );
}

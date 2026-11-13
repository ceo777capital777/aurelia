"use client";

import { useMemo } from "react";
import type { Apartment } from "@/data/building";
import { FurnitureSet } from "./furniture";
import { getFurniture, getWallColliders } from "./interiorLayout";
import { makeStoneTexture } from "./textures";
import type { Quality, TimeOfDay } from "./types";

function Walls() {
  const boxes = getWallColliders();
  return (
    <group>
      {boxes.map((wall, index) => {
        const width = wall.maxX - wall.minX;
        const depth = wall.maxZ - wall.minZ;
        const glass = wall.maxZ < -10.95 || wall.minZ < -13.1;
        const height = glass && wall.minZ < -13.2 ? 1.05 : 2.8;
        const y = glass && wall.minZ < -13.2 ? 0.55 : 1.4;
        return (
          <mesh key={index} position={[(wall.minX + wall.maxX) / 2, y, (wall.minZ + wall.maxZ) / 2]} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            {glass ? (
              <meshPhysicalMaterial color="#d7e6f2" transparent opacity={0.08} roughness={0.02} transmission={0.92} thickness={0.05} />
            ) : (
              <meshStandardMaterial color="#e4ddd2" roughness={0.84} />
            )}
          </mesh>
        );
      })}
      <mesh position={[-1.15, 1.4, 0.02]}>
        <boxGeometry args={[0.08, 2.8, 0.1]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[1.15, 1.4, 0.02]}>
        <boxGeometry args={[0.08, 2.8, 0.1]} />
        <meshStandardMaterial color="#C5A46D" metalness={0.55} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function ApartmentInterior({
  apartment,
  time,
  quality,
}: {
  apartment: Apartment;
  time: TimeOfDay;
  quality: Quality;
}) {
  const stone = useMemo(() => makeStoneTexture(), []);
  const pieces = useMemo(() => getFurniture(apartment.bedrooms), [apartment.bedrooms]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]} receiveShadow>
        <planeGeometry args={[12.8, 12]} />
        <meshStandardMaterial map={stone} roughness={0.62} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -13.2]} receiveShadow>
        <planeGeometry args={[12.8, 2.5]} />
        <meshStandardMaterial color="#b08960" roughness={0.78} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.9, -6]}>
        <planeGeometry args={[12.8, 14.6]} />
        <meshStandardMaterial color="#f6f3ee" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.88, -4.2]}>
        <boxGeometry args={[1.2, 0.03, 1.2]} />
        <meshStandardMaterial color="#fff4e2" emissive="#ffd7a4" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-3.2, 2.88, -9]}>
        <boxGeometry args={[0.7, 0.03, 0.7]} />
        <meshStandardMaterial color="#fff4e2" emissive="#ffd7a4" emissiveIntensity={0.7} />
      </mesh>
      <pointLight position={[0, 2.5, -4.2]} intensity={time === "evening" ? 2.4 : 1.1} distance={9} color="#ffe0bf" />
      <pointLight position={[-2.4, 2.3, -9]} intensity={0.8} distance={6} color="#fff0d8" />
      <pointLight position={[4.2, 2.1, -3.4]} intensity={0.7} distance={5} color="#fff0d8" />

      <Walls />
      {quality === "high" && (
        <>
          <mesh position={[-4.6, 1.55, -11.7]}>
            <planeGeometry args={[1.4, 2.4]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.14} side={2} />
          </mesh>
          <mesh position={[4.6, 1.55, -11.7]}>
            <planeGeometry args={[1.4, 2.4]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.14} side={2} />
          </mesh>
        </>
      )}
      <FurnitureSet pieces={pieces} />
    </group>
  );
}

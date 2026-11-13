"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeCityTexture } from "./textures";
import type { Quality, TimeOfDay } from "./types";

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function DubaiSkyline({
  time,
  quality,
  variant,
}: {
  time: TimeOfDay;
  quality: Quality;
  variant: "context" | "window";
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = variant === "window" ? (quality === "low" ? 26 : 42) : quality === "low" ? 32 : 72;
  const textures = useMemo(() => makeCityTexture(), []);

  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const random = mulberry32(variant === "window" ? 11 : 4);
    const dummy = new THREE.Object3D();
    let index = 0;
    for (let i = 0; i < count; i += 1) {
      let x = 0;
      let z = 0;
      if (variant === "window") {
        x = (random() - 0.5) * 180;
        z = -28 - random() * 130;
      } else {
        const angle = random() * Math.PI * 2;
        const radius = 95 + random() * 230;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        if (z > 30 && Math.abs(x) < 80) z = -Math.abs(z) - 20;
      }
      const height = variant === "window" ? 6 + random() * 26 : 16 + random() ** 1.6 * 150;
      const width = 7 + random() * 14;
      const depth = width * (0.55 + random() * 0.7);
      dummy.position.set(x, height / 2, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      target.setMatrixAt(index, dummy.matrix);
      index += 1;
    }
    target.count = index;
    target.instanceMatrix.needsUpdate = true;
  }, [count, variant]);

  useLayoutEffect(() => () => {
    textures.map.dispose();
    textures.emissive.dispose();
  }, [textures]);

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={textures.map}
          emissiveMap={textures.emissive}
          emissive="#ffc59a"
          emissiveIntensity={variant === "window" ? (time === "evening" ? 1.35 : 0.62) : time === "evening" ? 0.9 : 0.08}
          roughness={0.45}
          metalness={0.35}
        />
      </instancedMesh>
      <mesh position={variant === "window" ? [-28, 48, -78] : [-70, 78, -150]}>
        <boxGeometry args={[16, 96, 16]} />
        <meshStandardMaterial color="#9db0c2" metalness={0.72} roughness={0.18} />
      </mesh>
      <mesh position={variant === "window" ? [-28, 100, -78] : [-70, 132, -150]}>
        <cylinderGeometry args={[0.4, 5, 18, 8]} />
        <meshStandardMaterial color="#d7dee6" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={variant === "window" ? [34, 36, -96] : [120, 52, -120]}>
        <boxGeometry args={[22, 72, 14]} />
        <meshStandardMaterial color="#8ea0b0" metalness={0.66} roughness={0.22} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={variant === "window" ? [10, -0.35, -78] : [30, -0.15, 20]}
        receiveShadow
      >
        <planeGeometry args={variant === "window" ? [210, 120] : [520, 520]} />
        <meshStandardMaterial
          color={time === "day" ? "#6a645c" : "#101318"}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={variant === "window" ? [0, -0.3, -36] : [48, 0.02, 78]}>
        <planeGeometry args={variant === "window" ? [80, 16] : [240, 70]} />
        <meshStandardMaterial
          color={time === "day" ? "#7ea4b8" : "#0c1c2a"}
          metalness={0.72}
          roughness={0.16}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  );
}

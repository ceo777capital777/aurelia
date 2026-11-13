"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { getTowerTop, type FloorSpec } from "@/data/building";
import { debugState } from "./debug";
import type { ViewMode } from "./types";

const HOME_POS = new THREE.Vector3(132, 96, 248);
const HOME_TARGET = new THREE.Vector3(0, 70, 10);

export const cameraCommands = { zoom: 0, reset: 0 };

export function BuildingControls({
  mode,
  floorSpec,
  enabled,
  autoRotate,
  onUserInteract,
}: {
  mode: Extract<ViewMode, "building" | "floor">;
  floorSpec: FloorSpec | null;
  enabled: boolean;
  autoRotate: boolean;
  onUserInteract: () => void;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const blend = useRef(1);
  const goalPos = useRef(HOME_POS.clone());
  const goalTarget = useRef(HOME_TARGET.clone());

  useEffect(() => {
    controls.current?.target.copy(HOME_TARGET);
    blend.current = 1;
  }, [mode, floorSpec?.floor]);

  useFrame(() => {
    const current = controls.current;
    if (!current) return;
    if (mode === "floor" && floorSpec) {
      const podium = floorSpec.kind === "amenity" ? 4 : 0;
      goalTarget.current.set(0, floorSpec.baseY + 1.2, podium + 22);
      goalPos.current.set(goalTarget.current.x + 12, goalTarget.current.y + 24, goalTarget.current.z + 20);
    } else {
      goalTarget.current.copy(HOME_TARGET);
      goalPos.current.copy(HOME_POS);
    }
    current.target.lerp(goalTarget.current, blend.current > 0 ? 0.08 : 1);
    if (blend.current > 0) {
      camera.position.lerp(goalPos.current, 0.075);
      blend.current = Math.max(0, blend.current - 0.012);
    }
    if (cameraCommands.reset) {
      blend.current = 1;
      cameraCommands.reset = 0;
    }
    if (cameraCommands.zoom !== 0) {
      const offset = camera.position.clone().sub(current.target);
      const distance = THREE.MathUtils.clamp(offset.length() * (cameraCommands.zoom > 0 ? 0.84 : 1.18), mode === "floor" ? 10 : 48, mode === "floor" ? 110 : 360);
      offset.setLength(distance);
      camera.position.copy(current.target).add(offset);
      cameraCommands.zoom = 0;
      blend.current = 0;
    }
    debugState.azimuth = current.getAzimuthalAngle();
  });

  return (
    <OrbitControls
      ref={controls}
      enabled={enabled}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate && mode === "building"}
      autoRotateSpeed={0.55}
      minDistance={mode === "floor" ? 10 : 48}
      maxDistance={mode === "floor" ? 110 : 360}
      minPolarAngle={mode === "floor" ? 0.28 : 0.78}
      maxPolarAngle={mode === "floor" ? 1.28 : 1.38}
      onStart={() => {
        blend.current = 0;
        onUserInteract();
      }}
    />
  );
}

export function towerHeight() {
  return getTowerTop();
}

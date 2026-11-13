"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import type { Apartment, FloorSpec } from "@/data/building";
import { ApartmentInterior } from "./ApartmentInterior";
import { BuildingControls } from "./BuildingControls";
import { BuildingModel } from "./BuildingModel";
import { debugState } from "./debug";
import { DubaiSkyline } from "./DubaiSkyline";
import { Lights, SkyRig } from "./SkyRig";
import type { Quality, TimeOfDay, ViewMode } from "./types";
import { WalkController } from "./WalkController";

function QualityWatch({ onLow }: { onLow: () => void }) {
  const armed = useRef(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      armed.current = true;
    }, 2800);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <PerformanceMonitor
      ms={300}
      iterations={6}
      flipflops={2}
      onDecline={() => {
        if (armed.current) onLow();
      }}
    >
      <AdaptiveDpr pixelated />
    </PerformanceMonitor>
  );
}

export function MainScene({
  mode,
  floorSpec,
  apartment,
  apartments,
  hoveredFloor,
  selectedFloor,
  hoveredApt,
  selectedApt,
  time,
  quality,
  autoRotate,
  rendering,
  onReady,
  onLowQuality,
  onHoverFloor,
  onSelectFloor,
  onHoverApt,
  onSelectApt,
  onUserInteract,
}: {
  mode: ViewMode;
  floorSpec: FloorSpec | null;
  apartment: Apartment | null;
  apartments: Apartment[];
  hoveredFloor: number | null;
  selectedFloor: number | null;
  hoveredApt: string | null;
  selectedApt: string | null;
  time: TimeOfDay;
  quality: Quality;
  autoRotate: boolean;
  rendering: boolean;
  onReady: () => void;
  onLowQuality: () => void;
  onHoverFloor: (floor: number | null) => void;
  onSelectFloor: (floor: number) => void;
  onHoverApt: (id: string | null) => void;
  onSelectApt: (id: string) => void;
  onUserInteract: () => void;
}) {
  const exploring = mode === "walk";
  return (
    <Canvas
      camera={{ position: [132, 96, 248], fov: 28, near: 0.1, far: 1800 }}
      dpr={quality === "low" ? 1 : [1, 1.6]}
      shadows={quality === "high"}
      frameloop={rendering ? "always" : "demand"}
      gl={{ antialias: quality !== "low", alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#080A0D");
        debugState.gl = true;
        onReady();
      }}
    >
      <QualityWatch onLow={onLowQuality} />
      <SkyRig time={time} exposure={exploring ? 0.98 : time === "day" ? 0.92 : 0.8} />
      <Lights time={time} interior={exploring} quality={quality} />
      {(mode === "building" || mode === "floor") && (
        <fog attach="fog" args={[time === "day" ? "#d9d3c8" : "#120e12", 120, 520]} />
      )}
      {!exploring && (
        <>
          <DubaiSkyline time={time} quality={quality} variant="context" />
          <BuildingModel
            apartments={apartments}
            hoveredFloor={hoveredFloor}
            selectedFloor={selectedFloor}
            ghost={mode === "floor"}
            time={time}
            quality={quality}
            interactive
            hoveredApt={hoveredApt}
            selectedApt={selectedApt}
            onHoverFloor={onHoverFloor}
            onSelectFloor={onSelectFloor}
            onHoverApt={onHoverApt}
            onSelectApt={onSelectApt}
          />
          <BuildingControls
            mode={mode === "floor" ? "floor" : "building"}
            floorSpec={floorSpec}
            enabled
            autoRotate={autoRotate}
            onUserInteract={onUserInteract}
          />
        </>
      )}
      {exploring && apartment && (
        <>
          <DubaiSkyline time={time} quality={quality} variant="window" />
          <ApartmentInterior apartment={apartment} time={time} quality={quality} />
          <WalkController bedrooms={apartment.bedrooms} active />
        </>
      )}
    </Canvas>
  );
}

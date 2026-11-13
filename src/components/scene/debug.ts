import type { ViewMode } from "./types";

export const debugState = {
  mode: "building" as ViewMode,
  floor: null as number | null,
  apartmentId: null as string | null,
  azimuth: 0,
  player: { x: 0, y: 1.62, z: -2.05 },
  collided: false,
  blockedMoves: 0,
  moved: false,
  gl: false,
};

export function publishDebug() {
  if (typeof window === "undefined") return;
  (window as unknown as { __AURELIA__?: typeof debugState }).__AURELIA__ = debugState;
}

import * as THREE from "three";

export function roundedRectShape(width: number, depth: number, radius: number) {
  const hw = width / 2;
  const hd = depth / 2;
  const r = Math.min(radius, hw - 0.05, hd - 0.05);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.absarc(hw - r, -hd + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hd - r);
  shape.absarc(hw - r, hd - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hd);
  shape.absarc(-hw + r, hd - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hd + r);
  shape.absarc(-hw + r, -hd + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

export function extrudeRounded(width: number, depth: number, radius: number, height: number) {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, depth, radius), {
    depth: height,
    bevelEnabled: false,
    curveSegments: 4,
  });
  geometry.computeVertexNormals();
  return geometry;
}

export type PerimeterPoint = { x: number; z: number; nx: number; nz: number };

export function samplePerimeter(width: number, depth: number, radius: number, spacing: number): PerimeterPoint[] {
  const hw = width / 2;
  const hd = depth / 2;
  const r = Math.min(radius, hw - 0.2, hd - 0.2);
  const pts: PerimeterPoint[] = [];
  const pushLine = (x0: number, z0: number, x1: number, z1: number, nx: number, nz: number) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const steps = Math.max(1, Math.round(len / spacing));
    for (let i = 0; i < steps; i += 1) {
      const t = (i + 0.5) / steps;
      pts.push({ x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t, nx, nz });
    }
  };
  pushLine(-hw + r, -hd, hw - r, -hd, 0, -1);
  pushLine(hw, -hd + r, hw, hd - r, 1, 0);
  pushLine(hw - r, hd, -hw + r, hd, 0, 1);
  pushLine(-hw, hd - r, -hw, -hd + r, -1, 0);
  const corner = (cx: number, cz: number, a0: number, a1: number) => {
    const steps = 2;
    for (let i = 0; i <= steps; i += 1) {
      const a = a0 + ((a1 - a0) * i) / steps;
      pts.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, nx: Math.cos(a), nz: Math.sin(a) });
    }
  };
  corner(hw - r, -hd + r, -Math.PI / 2, 0);
  corner(hw - r, hd - r, 0, Math.PI / 2);
  corner(-hw + r, hd - r, Math.PI / 2, Math.PI);
  corner(-hw + r, -hd + r, Math.PI, Math.PI * 1.5);
  return pts;
}

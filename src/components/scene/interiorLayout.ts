export type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number };

export type PieceKind =
  | "sofa"
  | "table"
  | "bed"
  | "kitchen"
  | "island"
  | "stool"
  | "plant"
  | "lamp"
  | "media"
  | "wardrobe"
  | "vanity"
  | "toilet"
  | "shower"
  | "lounger"
  | "rug"
  | "art"
  | "dining"
  | "desk";

export type Piece = {
  kind: PieceKind;
  position: [number, number, number];
  rotation?: number;
  collider?: [number, number, number];
  minBeds?: number;
  maxBeds?: number;
};

export const INTERIOR_BOUNDS = { minX: -6.15, maxX: 6.15, minZ: -14.15, maxZ: -0.25 };
export const PLAYER_RADIUS = 0.27;
export const EYE_HEIGHT = 1.62;

function box(minX: number, maxX: number, minZ: number, maxZ: number): Aabb {
  return {
    minX: Math.min(minX, maxX),
    maxX: Math.max(minX, maxX),
    minZ: Math.min(minZ, maxZ),
    maxZ: Math.max(minZ, maxZ),
  };
}

export function getWallColliders(): Aabb[] {
  return [
    box(-6.5, -1.15, -0.08, 0.1),
    box(-1.2, 1.2, -0.06, 0.1),
    box(1.15, 6.5, -0.08, 0.1),
    box(-6.56, -6.32, -11.2, 0.08),
    box(6.32, 6.56, -11.2, 0.08),
    box(-6.5, -1.35, -11.28, -11.08),
    box(1.35, 6.5, -11.28, -11.08),
    box(-6.5, -2.45, -6.9, -6.74),
    box(-2.52, -2.36, -11.2, -8.15),
    box(-2.52, -2.36, -7.15, -6.74),
    box(2.5, 6.5, -6.7, -6.54),
    box(2.36, 2.52, -11.2, -8.05),
    box(2.36, 2.52, -7.0, -6.54),
    box(-6.5, -4.7, -9.55, -9.4),
    box(-4.78, -4.62, -11.15, -10.15),
    box(-4.78, -4.62, -9.55, -9.4),
    box(4.5, 6.5, -8.55, -8.4),
    box(4.42, 4.58, -8.55, -7.7),
    box(-6.6, 6.6, -14.45, -14.22),
    box(-6.6, -6.38, -14.45, -11.15),
    box(6.38, 6.6, -14.45, -11.15),
  ];
}

const PIECES: Piece[] = [
  { kind: "rug", position: [-3.35, 0.015, -4.9] },
  { kind: "sofa", position: [-3.35, 0, -4.15], rotation: Math.PI, collider: [2.25, 0.75, 0.92] },
  { kind: "table", position: [-3.35, 0, -5.15], collider: [1.05, 0.38, 0.6] },
  { kind: "media", position: [-6.05, 0, -4.3], collider: [0.42, 0.55, 1.55] },
  { kind: "lamp", position: [-5.15, 0, -2.55], collider: [0.32, 1.5, 0.32] },
  { kind: "plant", position: [-5.4, 0, -1.35], collider: [0.4, 1.1, 0.4] },
  { kind: "art", position: [-6.28, 1.5, -3.1], rotation: Math.PI / 2 },
  { kind: "kitchen", position: [5.85, 0, -3.3], rotation: Math.PI / 2, collider: [3.6, 0.92, 0.62] },
  { kind: "island", position: [4.15, 0, -3.3], collider: [0.7, 0.92, 1.35] },
  { kind: "stool", position: [3.55, 0, -2.75] },
  { kind: "stool", position: [3.55, 0, -3.45] },
  { kind: "stool", position: [3.55, 0, -4.1] },
  { kind: "dining", position: [2.15, 0, -5.35], collider: [0.82, 0.76, 1.35] },
  { kind: "bed", position: [-4.45, 0, -8.55], collider: [1.65, 0.62, 2.05] },
  { kind: "wardrobe", position: [-6.05, 0, -7.7], collider: [0.42, 2.1, 1.15] },
  { kind: "vanity", position: [-5.6, 0, -10.7], collider: [1.1, 0.8, 0.46] },
  { kind: "toilet", position: [-4.95, 0, -10.15], collider: [0.4, 0.45, 0.55] },
  { kind: "shower", position: [-5.85, 0, -10.05], collider: [0.7, 1.9, 0.7] },
  { kind: "bed", position: [4.35, 0, -9.5], collider: [1.6, 0.62, 2.05], minBeds: 2 },
  { kind: "wardrobe", position: [3.15, 0, -10.75], collider: [1.15, 2.0, 0.42], minBeds: 2 },
  { kind: "desk", position: [4.2, 0, -9.6], collider: [1.2, 0.75, 0.58], maxBeds: 1 },
  { kind: "vanity", position: [5.55, 0, -7.15], rotation: Math.PI, collider: [1.05, 0.8, 0.42] },
  { kind: "toilet", position: [4.85, 0, -7.85], collider: [0.4, 0.45, 0.55] },
  { kind: "lounger", position: [-2.35, 0, -13.05], rotation: Math.PI, collider: [0.68, 0.4, 1.45] },
  { kind: "lounger", position: [2.15, 0, -13.05], rotation: Math.PI, collider: [0.68, 0.4, 1.45] },
  { kind: "plant", position: [-5.5, 0, -13.2], collider: [0.4, 0.8, 0.4] },
  { kind: "plant", position: [5.4, 0, -12.9], collider: [0.4, 0.8, 0.4] },
];

export function getFurniture(bedrooms: number) {
  return PIECES.filter((piece) => {
    if (piece.minBeds && bedrooms < piece.minBeds) return false;
    if (piece.maxBeds && bedrooms > piece.maxBeds) return false;
    return true;
  });
}

export function pieceAabb(piece: Piece): Aabb | null {
  if (!piece.collider) return null;
  const [sx, , sz] = piece.collider;
  const rotation = piece.rotation ?? 0;
  const swap = Math.abs(Math.sin(rotation)) > 0.7;
  const hx = (swap ? sz : sx) / 2;
  const hz = (swap ? sx : sz) / 2;
  return box(piece.position[0] - hx, piece.position[0] + hx, piece.position[2] - hz, piece.position[2] + hz);
}

export function getColliders(bedrooms: number) {
  const furniture = getFurniture(bedrooms)
    .map(pieceAabb)
    .filter((item): item is Aabb => item !== null);
  return [...getWallColliders(), ...furniture];
}

export function blocked(x: number, z: number, colliders: Aabb[], radius = PLAYER_RADIUS) {
  for (const box of colliders) {
    const cx = Math.min(Math.max(x, box.minX), box.maxX);
    const cz = Math.min(Math.max(z, box.minZ), box.maxZ);
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < radius * radius) return true;
  }
  return false;
}

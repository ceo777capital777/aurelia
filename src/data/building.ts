export type ApartmentStatus = "Available" | "Reserved" | "Sold";

export type FloorKind = "amenity" | "residence" | "penthouse";

export type Apartment = {
  id: string;
  number: string;
  floor: number;
  slot: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  price: number;
  status: ApartmentStatus;
  view: string;
  features: string[];
  layout: string;
};

export type FloorSpec = {
  floor: number;
  kind: FloorKind;
  baseY: number;
  height: number;
  width: number;
  depth: number;
  radius: number;
};

export type Zone = {
  position: [number, number, number];
  size: [number, number, number];
};

const STATUSES: ApartmentStatus[] = ["Available", "Reserved", "Sold"];

const FORCED_STATUS: Record<string, ApartmentStatus> = {
  "A-3501": "Available",
  "A-3502": "Reserved",
  "A-1201": "Available",
  "A-303": "Available",
  "A-1802": "Reserved",
  "A-1803": "Sold",
  "A-2501": "Sold",
  "A-904": "Sold",
  "A-2102": "Reserved",
  "A-3301": "Available",
};

type UnitTemplate = {
  slot: string;
  index: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  view: string;
};

const RESIDENCE_UNITS: UnitTemplate[] = [
  { slot: "A", index: 1, bedrooms: 2, bathrooms: 2, area: 128, type: "2 Bedroom", view: "Canal and district" },
  { slot: "B", index: 2, bedrooms: 3, bathrooms: 3, area: 172, type: "3 Bedroom", view: "Downtown skyline" },
  { slot: "C", index: 3, bedrooms: 1, bathrooms: 1, area: 74, type: "1 Bedroom", view: "Podium gardens" },
  { slot: "D", index: 4, bedrooms: 2, bathrooms: 2, area: 116, type: "2 Bedroom", view: "Western city lights" },
];

const PENTHOUSE_UNITS: UnitTemplate[] = [
  { slot: "A", index: 1, bedrooms: 2, bathrooms: 2, area: 145, type: "Penthouse", view: "Panoramic skyline" },
  { slot: "B", index: 2, bedrooms: 3, bathrooms: 4, area: 268, type: "Penthouse", view: "Sea and downtown" },
];

function hashString(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export function floorKind(floor: number): FloorKind {
  if (floor <= 2) return "amenity";
  if (floor >= 33) return "penthouse";
  return "residence";
}

export function apartmentNumber(floor: number, index: number) {
  return `A-${floor}${String(index).padStart(2, "0")}`;
}

function statusFor(number: string): ApartmentStatus {
  if (FORCED_STATUS[number]) return FORCED_STATUS[number];
  const n = hashString(number);
  if (n < 0.12) return "Sold";
  if (n < 0.22) return "Reserved";
  return "Available";
}

function computePrice(floor: number, area: number, penthouse: boolean) {
  const ppm = 14200;
  const floorFactor = 1 + (floor - 1) * 0.012;
  const kind = penthouse ? 1.18 : 1;
  return Math.round((ppm * area * floorFactor * kind) / 1000) * 1000;
}

function featuresFor(type: string, penthouse: boolean) {
  if (penthouse) {
    return ["Private sky terrace", "Panoramic glazing", "Direct lift lobby", "Summer kitchen", "Underfloor cooling"];
  }
  const base = ["Floor-to-ceiling glazing", "Smart lighting", "Engineered stone kitchen", "Marble bathroom"];
  if (type.startsWith("3")) return [...base, "Family room", "Service entrance"];
  if (type.startsWith("1")) return [...base, "Open kitchen"];
  return [...base, "Walk-in wardrobe"];
}

function unitToApartment(floor: number, unit: UnitTemplate, penthouse: boolean): Apartment {
  const number = apartmentNumber(floor, unit.index);
  const price = number === "A-3501" ? 2450000 : computePrice(floor, unit.area, penthouse);
  return {
    id: number,
    number,
    floor,
    slot: unit.slot,
    area: unit.area,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    type: unit.type,
    price,
    status: statusFor(number),
    view: unit.view,
    features: featuresFor(unit.type, penthouse),
    layout: unit.slot,
  };
}

let apartmentCache: Apartment[] | null = null;

export function getSeedApartments(): Apartment[] {
  if (apartmentCache) return apartmentCache.map((item) => ({ ...item, features: [...item.features] }));
  const list: Apartment[] = [];
  for (let floor = 3; floor <= 32; floor += 1) {
    for (const unit of RESIDENCE_UNITS) list.push(unitToApartment(floor, unit, false));
  }
  for (let floor = 33; floor <= 35; floor += 1) {
    for (const unit of PENTHOUSE_UNITS) list.push(unitToApartment(floor, unit, true));
  }
  apartmentCache = list;
  return list.map((item) => ({ ...item, features: [...item.features] }));
}

let floorCache: FloorSpec[] | null = null;

export function getFloorSpecs(): FloorSpec[] {
  if (floorCache) return floorCache;
  const specs: FloorSpec[] = [];
  let y = 0;
  for (let floor = 1; floor <= 35; floor += 1) {
    let height = 3.48;
    let width = 32;
    let depth = 24;
    let radius = 1.45;
    let kind: FloorKind = "residence";
    if (floor <= 2) {
      height = 5.15;
      width = 50;
      depth = 36;
      radius = 1.8;
      kind = "amenity";
    } else if (floor <= 18) {
      height = 3.42;
      width = 32;
      depth = 24;
      radius = 1.45;
    } else if (floor <= 29) {
      height = 3.42;
      width = 27.5;
      depth = 21;
      radius = 1.25;
    } else if (floor <= 32) {
      height = 3.7;
      width = 23.5;
      depth = 18;
      radius = 1.05;
    } else {
      height = 4.45;
      width = 21;
      depth = 17;
      radius = 0.9;
      kind = "penthouse";
    }
    specs.push({ floor, kind, baseY: y, height, width, depth, radius });
    y += height;
  }
  floorCache = specs;
  return specs;
}

export function getTowerTop() {
  const specs = getFloorSpecs();
  const last = specs[specs.length - 1];
  return last.baseY + last.height;
}

export function getApartmentZone(layout: string, floor: number): Zone {
  if (floor >= 33) {
    if (layout === "A") return { position: [-8.2, 0.1, 0], size: [13.4, 0.08, 20.2] };
    return { position: [8.2, 0.1, 0], size: [13.4, 0.08, 20.2] };
  }
  const map: Record<string, [number, number, number]> = {
    A: [-9.85, 0.1, -7.4],
    B: [9.85, 0.1, -7.4],
    C: [9.85, 0.1, 7.4],
    D: [-9.85, 0.1, 7.4],
  };
  return { position: map[layout] ?? map.A, size: [11.3, 0.08, 6.35] };
}

export function apartmentsOnFloor(list: Apartment[], floor: number) {
  return list.filter((item) => item.floor === floor).sort((a, b) => a.number.localeCompare(b.number, "en", { numeric: true }));
}

export function getBuildingStats(list: Apartment[]) {
  const available = list.filter((item) => item.status === "Available");
  const startingPrice = available.length ? Math.min(...available.map((item) => item.price)) : 0;
  return {
    name: "AURELIA RESIDENCE",
    location: "Business Bay, Dubai, UAE",
    floors: 35,
    parkingLevels: 4,
    amenityFloors: 2,
    residentialFloors: 30,
    penthouseFloors: 3,
    apartments: list.length,
    available: available.length,
    reserved: list.filter((item) => item.status === "Reserved").length,
    sold: list.filter((item) => item.status === "Sold").length,
    startingPrice,
  };
}

export function isApartmentStatus(value: string): value is ApartmentStatus {
  return STATUSES.includes(value as ApartmentStatus);
}

export const PROJECT = {
  latitude: 25.1866,
  longitude: 55.2644,
  address: "Aurelia Promenade, Business Bay, Dubai, UAE",
};

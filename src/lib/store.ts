import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  getSeedApartments,
  isApartmentStatus,
  type Apartment,
  type ApartmentStatus,
} from "@/data/building";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  apartmentId: string;
  apartmentNumber: string;
  floor: number;
  area: number;
  price: number;
  status: string;
  createdAt: string;
};

export type LeadInput = Omit<Lead, "id" | "createdAt">;

const dataDir = path.join(process.cwd(), "data");
const leadsFile = path.join(dataDir, "leads.json");
const overridesFile = path.join(dataDir, "overrides.json");

let prisma: PrismaClient | null = null;
let dbDisabled = false;
let apartments: Apartment[] | null = null;
let leads: Lead[] | null = null;

const hits = new Map<string, number[]>();

function getPrisma() {
  if (dbDisabled || !process.env.DATABASE_URL) return null;
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 2));
  } catch {
    // Ephemeral or read-only filesystems keep the in-memory copy.
  }
}

function applyOverrides(list: Apartment[]) {
  const overrides = readJson<Record<string, { price?: number; status?: ApartmentStatus }>>(overridesFile, {});
  return list.map((item) => {
    const patch = overrides[item.id];
    if (!patch) return item;
    return {
      ...item,
      price: typeof patch.price === "number" ? patch.price : item.price,
      status: patch.status && isApartmentStatus(patch.status) ? patch.status : item.status,
    };
  });
}

function memoryApartments() {
  if (!apartments) apartments = applyOverrides(getSeedApartments());
  return apartments;
}

function memoryLeads() {
  if (!leads) leads = readJson<Lead[]>(leadsFile, []);
  return leads;
}

function saveOverrides(list: Apartment[]) {
  const seed = new Map(getSeedApartments().map((item) => [item.id, item]));
  const overrides: Record<string, { price: number; status: ApartmentStatus }> = {};
  for (const item of list) {
    const original = seed.get(item.id);
    if (!original) continue;
    if (original.price !== item.price || original.status !== item.status) {
      overrides[item.id] = { price: item.price, status: item.status };
    }
  }
  writeJson(overridesFile, overrides);
}

type ApartmentRow = {
  id: string;
  number: string;
  floor: number;
  slot: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  price: number;
  status: string;
  view: string;
  features: string;
  layout: string;
};

function toRow(item: Apartment): ApartmentRow {
  return { ...item, features: JSON.stringify(item.features) };
}

function fromRow(row: ApartmentRow): Apartment {
  let features: string[] = [];
  try {
    const parsed = JSON.parse(row.features) as unknown;
    if (Array.isArray(parsed)) features = parsed.map(String);
  } catch {
    features = [];
  }
  return {
    ...row,
    status: isApartmentStatus(row.status) ? row.status : "Available",
    features,
  };
}

export function rateLimit(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((stamp) => now - stamp < 10 * 60 * 1000);
  if (recent.length >= 8) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export async function listApartments() {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.apartment.findMany({ orderBy: [{ floor: "asc" }, { number: "asc" }] });
      if (rows.length === 0) {
        const seed = getSeedApartments();
        await db.apartment.createMany({ data: seed.map(toRow) });
        return seed;
      }
      return rows.map(fromRow);
    } catch {
      dbDisabled = true;
    }
  }
  return memoryApartments();
}

export async function updateApartment(id: string, patch: { price?: number; status?: ApartmentStatus }) {
  const data: { price?: number; status?: string } = {};
  if (typeof patch.price === "number" && Number.isFinite(patch.price) && patch.price > 0) {
    data.price = Math.round(patch.price);
  }
  if (patch.status && isApartmentStatus(patch.status)) data.status = patch.status;
  if (!Object.keys(data).length) return null;

  const db = getPrisma();
  if (db) {
    try {
      const row = await db.apartment.update({ where: { id }, data });
      return fromRow(row);
    } catch {
      dbDisabled = true;
    }
  }

  const list = memoryApartments();
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return null;
  list[index] = {
    ...list[index],
    price: data.price ?? list[index].price,
    status: data.status && isApartmentStatus(data.status) ? data.status : list[index].status,
  };
  saveOverrides(list);
  return list[index];
}

export async function createLead(input: LeadInput) {
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const db = getPrisma();
  if (db) {
    try {
      const row = await db.lead.create({
        data: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          message: lead.message,
          apartmentId: lead.apartmentId,
          apartmentNumber: lead.apartmentNumber,
          floor: lead.floor,
          area: lead.area,
          price: lead.price,
          status: lead.status,
          createdAt: new Date(lead.createdAt),
        },
      });
      return { ...lead, createdAt: row.createdAt.toISOString() };
    } catch {
      dbDisabled = true;
    }
  }
  const all = memoryLeads();
  all.unshift(lead);
  leads = all;
  writeJson(leadsFile, all);
  return lead;
}

export async function listLeads() {
  const db = getPrisma();
  if (db) {
    try {
      const rows = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        message: row.message,
        apartmentId: row.apartmentId,
        apartmentNumber: row.apartmentNumber,
        floor: row.floor,
        area: row.area,
        price: row.price,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      }));
    } catch {
      dbDisabled = true;
    }
  }
  return memoryLeads();
}

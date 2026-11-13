"use client";

import { useEffect, useMemo, useState } from "react";
import type { Apartment, ApartmentStatus } from "@/data/building";
import { formatAED } from "@/lib/format";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  apartmentNumber: string;
  floor: number;
  area: number;
  price: number;
  status: string;
  createdAt: string;
};

export function AdminPanel() {
  const [configured, setConfigured] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  async function refresh() {
    const [homes, inbox] = await Promise.all([
      fetch("/api/apartments").then((response) => response.json()),
      fetch("/api/admin/leads").then((response) => response.json()),
    ]);
    setApartments(homes.apartments ?? []);
    setLeads(inbox.leads ?? []);
  }

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then(async (data: { ok: boolean; configured: boolean }) => {
        setConfigured(data.configured);
        setAuthed(data.ok);
        if (data.ok) await refresh();
      })
      .catch(() => setError("The desk could not be reached."));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error || "Unauthorized");
      return;
    }
    setAuthed(true);
    setPassword("");
    await refresh();
  }

  async function save(apartment: Apartment, price: number, status: ApartmentStatus) {
    setNotice("");
    const response = await fetch(`/api/admin/apartments/${apartment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price, status }),
    });
    if (!response.ok) {
      setNotice("The residence could not be updated.");
      return;
    }
    setNotice(`${apartment.number} updated.`);
    await refresh();
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return apartments;
    return apartments.filter((item) => `${item.number} ${item.floor} ${item.status}`.toLowerCase().includes(needle));
  }, [apartments, query]);

  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-[11px] tracking-[0.2em] text-muted">BACK TO SHOWROOM</a>
        <h1 className="mt-4 font-serif text-4xl">Residence desk</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">Edit demonstration prices and statuses, and read enquiries. Protected by ADMIN_PASSWORD.</p>
        {!configured && <p className="mt-6 text-sm text-gold">Set ADMIN_PASSWORD before opening the desk in production.</p>}
        {!authed && configured && (
          <form onSubmit={login} className="mt-8 max-w-sm space-y-3">
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-panel px-3 py-3 text-sm outline-none" placeholder="Password" />
            {error && <p className="text-sm text-[#e7b2b2]">{error}</p>}
            <button type="submit" className="rounded-full bg-gold px-5 py-3 text-xs tracking-[0.16em] text-ink">ENTER</button>
          </form>
        )}
        {authed && (
          <div className="mt-8 space-y-10">
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl">Residences</h2>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="rounded-full border border-white/10 bg-panel px-4 py-2 text-sm outline-none" />
              </div>
              {notice && <p className="mt-3 text-sm text-gold">{notice}</p>}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-[10px] tracking-[0.16em] text-muted">
                    <tr>
                      <th className="py-2">NUMBER</th>
                      <th>FLOOR</th>
                      <th>TYPE</th>
                      <th>PRICE</th>
                      <th>STATUS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((apartment) => (
                      <ApartmentRow key={apartment.id} apartment={apartment} onSave={save} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Enquiries</h2>
              <div className="mt-4 space-y-3">
                {leads.length === 0 && <p className="text-sm text-muted">No enquiries yet.</p>}
                {leads.map((lead) => (
                  <article key={lead.id} className="rounded-2xl border border-white/10 bg-panel p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="text-white">{lead.name}</p>
                      <p className="text-xs text-muted">{new Date(lead.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted">{lead.phone} · {lead.email}</p>
                    <p className="mt-2 text-sm">
                      {lead.apartmentNumber ? `${lead.apartmentNumber} · floor ${lead.floor} · ${lead.area} m² · ${formatAED(lead.price)} · ${lead.status}` : "General enquiry"}
                    </p>
                    {lead.message && <p className="mt-2 text-sm text-white/80">{lead.message}</p>}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function ApartmentRow({
  apartment,
  onSave,
}: {
  apartment: Apartment;
  onSave: (apartment: Apartment, price: number, status: ApartmentStatus) => void;
}) {
  const [price, setPrice] = useState(String(apartment.price));
  const [status, setStatus] = useState<ApartmentStatus>(apartment.status);
  useEffect(() => {
    setPrice(String(apartment.price));
    setStatus(apartment.status);
  }, [apartment.price, apartment.status]);
  return (
    <tr className="border-t border-white/10">
      <td className="py-3">{apartment.number}</td>
      <td>{apartment.floor}</td>
      <td>{apartment.type}</td>
      <td>
        <input value={price} onChange={(event) => setPrice(event.target.value)} className="w-32 rounded-lg border border-white/10 bg-ink px-2 py-1" />
      </td>
      <td>
        <select value={status} onChange={(event) => setStatus(event.target.value as ApartmentStatus)} className="rounded-lg border border-white/10 bg-ink px-2 py-1">
          <option>Available</option>
          <option>Reserved</option>
          <option>Sold</option>
        </select>
      </td>
      <td>
        <button type="button" onClick={() => onSave(apartment, Number(price), status)} className="text-xs tracking-[0.14em] text-gold">
          SAVE
        </button>
      </td>
    </tr>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Apartment } from "@/data/building";
import { formatAED, formatArea } from "@/lib/format";

type Props = {
  apartment: Apartment | null;
  variant?: "modal" | "section";
  onClose?: () => void;
};

export function BookingForm({ apartment, variant = "modal", onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          company,
          apartmentId: apartment?.id ?? "",
          apartmentNumber: apartment?.number ?? "",
          floor: apartment?.floor ?? 0,
          area: apartment?.area ?? 0,
          price: apartment?.price ?? 0,
          status: apartment?.status ?? "",
        }),
      });
      const data = (await response.json()) as { ok?: boolean; id?: string; error?: string };
      if (!response.ok || !data.ok || !data.id) {
        setError(data.error || "The request could not be sent.");
        return;
      }
      setDone({ id: data.id });
    } catch {
      setError("The request could not be sent.");
    } finally {
      setPending(false);
    }
  }

  const body = done ? (
    <div data-testid="lead-success" className="py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">✓</div>
      <h3 className="mt-4 font-serif text-3xl">Request received</h3>
      <p className="mt-3 text-sm leading-6 text-muted">
        A residence advisor will contact you about {apartment ? apartment.number : "Aurelia Residence"}. This is a demonstration enquiry — no purchase has been created.
      </p>
      <p className="mt-3 text-[11px] tracking-[0.16em] text-gold">REF {done.id.slice(0, 8).toUpperCase()}</p>
    </div>
  ) : (
    <form data-testid="lead-form" onSubmit={submit} className="space-y-3">
      {apartment && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
          <div>
            <p className="text-[10px] tracking-[0.16em] text-muted">APARTMENT</p>
            <p>{apartment.number}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.16em] text-muted">FLOOR</p>
            <p>{apartment.floor}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.16em] text-muted">AREA</p>
            <p>{formatArea(apartment.area)}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.16em] text-muted">PRICE</p>
            <p>{formatAED(apartment.price)}</p>
          </div>
        </div>
      )}
      <label className="block text-xs tracking-[0.14em] text-muted">
        NAME
        <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold" name="name" autoComplete="name" />
      </label>
      <label className="block text-xs tracking-[0.14em] text-muted">
        PHONE
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold" name="phone" autoComplete="tel" />
      </label>
      <label className="block text-xs tracking-[0.14em] text-muted">
        EMAIL
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold" name="email" autoComplete="email" />
      </label>
      <label className="block text-xs tracking-[0.14em] text-muted">
        NOTE
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 h-20 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-gold" name="message" />
      </label>
      <label className="absolute left-[-9999px]" aria-hidden="true">
        Company
        <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      {error && <p className="text-sm text-[#e7b2b2]">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-full bg-gold px-4 py-3 text-xs tracking-[0.16em] text-ink disabled:opacity-60">
        {pending ? "SENDING" : "SEND REQUEST"}
      </button>
    </form>
  );

  if (variant === "section") {
    return <div className="glass rounded-3xl p-6">{body}</div>;
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-black/50 p-4 md:items-center" data-testid="booking-modal">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.22em] text-gold">PRIVATE ENQUIRY</p>
            <h3 className="mt-1 font-serif text-3xl">Interested in this apartment</h3>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="text-xs tracking-[0.16em] text-muted">
              CLOSE
            </button>
          )}
        </div>
        {body}
      </motion.div>
    </div>
  );
}

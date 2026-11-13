"use client";

import { motion } from "framer-motion";
import type { Apartment } from "@/data/building";
import { formatAED, formatArea } from "@/lib/format";

export function ApartmentInfo({
  apartment,
  onEnter,
  onInterest,
  onClose,
}: {
  apartment: Apartment;
  onEnter: () => void;
  onInterest: () => void;
  onClose: () => void;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="pointer-events-auto absolute bottom-28 right-3 z-20 w-[min(92vw,23rem)] md:bottom-8 md:right-8"
      data-testid="apartment-panel"
    >
      <div className="glass rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.24em] text-gold">RESIDENCE</p>
            <h2 className="mt-1 font-serif text-3xl text-white">{apartment.number}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-xs tracking-[0.16em] text-muted" aria-label="Close apartment details">
            CLOSE
          </button>
        </div>
        <p className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[10px] tracking-[0.16em] ${apartment.status === "Available" ? "border-gold/50 text-gold" : "border-white/15 text-muted"}`}>
          {apartment.status}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[10px] tracking-[0.16em] text-muted">FLOOR</dt>
            <dd>{apartment.floor}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.16em] text-muted">AREA</dt>
            <dd>{formatArea(apartment.area)}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.16em] text-muted">BEDROOMS</dt>
            <dd>{apartment.bedrooms}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.16em] text-muted">BATHROOMS</dt>
            <dd>{apartment.bathrooms}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.16em] text-muted">TYPE</dt>
            <dd>{apartment.type}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.16em] text-muted">VIEW</dt>
            <dd>{apartment.view}</dd>
          </div>
        </dl>
        <p className="mt-4 font-serif text-2xl text-white">{formatAED(apartment.price)}</p>
        <p className="mt-1 text-xs text-muted">Layout {apartment.layout} · demonstration price</p>
        <ul className="mt-4 space-y-1 text-sm text-white/85">
          {apartment.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" data-testid="enter-apartment" onClick={onEnter} className="rounded-full bg-white px-4 py-3 text-xs tracking-[0.16em] text-ink">
            ENTER APARTMENT
          </button>
          <button type="button" data-testid="open-booking" onClick={onInterest} className="rounded-full border border-gold/60 px-4 py-3 text-xs tracking-[0.14em] text-gold">
            INTERESTED IN THIS APARTMENT
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

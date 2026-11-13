"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { getBuildingStats, type Apartment } from "@/data/building";
import { formatAED } from "@/lib/format";
import { BookingForm } from "./BookingForm";
import { BuildingModel } from "../scene/BuildingModel";
import { DubaiSkyline } from "../scene/DubaiSkyline";
import { Lights, SkyRig } from "../scene/SkyRig";
import type { TimeOfDay } from "../scene/types";

const AMENITIES = [
  { title: "Pool deck", copy: "A podium pool set above the arrival court, with a shaded canopy and the canal in front." },
  { title: "Fitness", copy: "A glass training room on the amenity floor, open to the morning light over Business Bay." },
  { title: "Restaurant", copy: "A residents’ dining room beside the deck — quiet, not a hotel lobby." },
  { title: "Spa", copy: "Treatment rooms on the second podium level, finished in stone and warm metal." },
  { title: "Lobby", copy: "A double-height arrival hall with a single reception desk and a gold ring of light." },
  { title: "Parking", copy: "Four basement levels, kept out of the elevation. Valet and residents’ bays." },
];

const SHOTS: { title: string; time: TimeOfDay; position: [number, number, number]; target: [number, number, number] }[] = [
  { title: "Bay elevation", time: "day", position: [78, 48, 116], target: [0, 58, 0] },
  { title: "Podium pool", time: "day", position: [28, 18, 48], target: [0, 12, 16] },
  { title: "Evening crown", time: "evening", position: [40, 130, 70], target: [0, 120, 0] },
  { title: "Facade", time: "evening", position: [36, 70, 54], target: [0, 64, 0] },
];

function Aim({ position, target }: { position: [number, number, number]; target: [number, number, number] }) {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, position, target]);
  return null;
}

function GalleryStage({ shot }: { shot: (typeof SHOTS)[number] }) {
  return (
    <Canvas camera={{ position: shot.position, fov: 32, near: 0.1, far: 900 }} dpr={1} gl={{ antialias: true, alpha: false }}>
      <Aim position={shot.position} target={shot.target} />
      <color attach="background" args={["#080A0D"]} />
      <SkyRig time={shot.time} exposure={shot.time === "day" ? 1.05 : 0.86} />
      <Lights time={shot.time} interior={false} quality="low" />
      <DubaiSkyline time={shot.time} quality="low" variant="context" />
      <BuildingModel
        apartments={[]}
        hoveredFloor={null}
        selectedFloor={null}
        ghost={false}
        time={shot.time}
        quality="low"
        interactive={false}
        hoveredApt={null}
        selectedApt={null}
        onHoverFloor={() => undefined}
        onSelectFloor={() => undefined}
        onHoverApt={() => undefined}
        onSelectApt={() => undefined}
      />
    </Canvas>
  );
}

export function AboutSection({ apartments }: { apartments: Apartment[] }) {
  const stats = getBuildingStats(apartments);
  return (
    <section id="about" className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-[1.1fr_0.9fr] md:px-8">
      <div>
        <p className="text-[11px] tracking-[0.28em] text-gold">ABOUT THE PROJECT</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">A glass tower composed for Business Bay.</h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted">
          Aurelia Residence is a fictional sales gallery: thirty residence floors over a two-storey podium, three sky-villa floors at the crown, and four basement parking levels that never appear in the elevation. The model in front of you is the showroom. Plans, interiors and prices are editable demonstration data.
        </p>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          The massing steps back three times. Terraces sit on those setbacks. The podium holds the lobby, pool, fitness room, restaurant and spa. The apartments behind the glass are reached from a central core — lifts, a stair, and a short corridor — the way a real plate is organised.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["35", "Storeys above grade"],
          ["4", "Basement parking levels"],
          [String(stats.apartments), "Residences in the model"],
          [formatAED(stats.startingPrice), "Starting demonstration price"],
        ].map(([value, label]) => (
          <div key={label} className="glass rounded-3xl p-5">
            <p className="font-serif text-3xl text-white">{value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AmenitiesSection() {
  return (
    <section id="amenities" className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <p className="text-[11px] tracking-[0.28em] text-gold">AMENITIES</p>
      <h2 className="mt-3 font-serif text-4xl md:text-5xl">The podium, kept for residents.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {AMENITIES.map((item) => (
          <article key={item.title} className="rounded-3xl border border-white/10 bg-panel/70 p-5">
            <h3 className="font-serif text-2xl">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const MARKERS: { name: string; position: [number, number]; note: string }[] = [
  { name: "Aurelia Residence", position: [25.1866, 55.2644], note: "Business Bay — demonstration site" },
  { name: "Burj Khalifa", position: [25.1972, 55.2744], note: "Downtown Dubai" },
  { name: "Dubai Mall", position: [25.1985, 55.2796], note: "Downtown" },
  { name: "DIFC", position: [25.2106, 55.281], note: "Financial district" },
  { name: "Dubai Canal", position: [25.1852, 55.258], note: "Waterfront" },
  { name: "Museum of the Future", position: [25.2192, 55.2823], note: "Sheikh Zayed Road" },
];

export function LocationSection() {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: { remove: () => void } | null = null;
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !node.current) return;
      const L = leaflet.default;
      const instance = L.map(node.current, { scrollWheelZoom: false }).setView([25.1866, 55.2644], 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(instance);
      const icon = L.divIcon({ className: "aurelia-pin", html: "<span></span>", iconSize: [16, 16] });
      for (const marker of MARKERS) {
        L.marker(marker.position, { icon }).addTo(instance).bindPopup(`<strong>${marker.name}</strong><br/>${marker.note}`);
      }
      map = instance;
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <section id="location" className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-[1.4fr_0.6fr] md:px-8">
      <div>
        <p className="text-[11px] tracking-[0.28em] text-gold">LOCATION</p>
        <h2 className="mt-3 font-serif text-4xl">Business Bay, facing the canal.</h2>
        <div ref={node} className="mt-6 h-[420px] overflow-hidden rounded-3xl border border-white/10" data-testid="location-map" />
        <p className="mt-2 text-[11px] text-muted">Map data © OpenStreetMap contributors, © CARTO.</p>
      </div>
      <ul className="space-y-3 pt-16">
        {MARKERS.map((marker) => (
          <li key={marker.name} className="border-b border-white/10 pb-3">
            <p className="text-sm text-white">{marker.name}</p>
            <p className="text-xs text-muted">{marker.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GallerySection() {
  const [shot, setShot] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const current = SHOTS[shot];

  return (
    <section id="gallery" ref={ref} className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <p className="text-[11px] tracking-[0.28em] text-gold">GALLERY</p>
      <h2 className="mt-3 font-serif text-4xl">Views rendered from the same model.</h2>
      <div className="mt-6 h-[460px] overflow-hidden rounded-3xl border border-white/10 bg-ink">
        {visible ? <GalleryStage key={current.title} shot={current} /> : <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] text-muted">LOADING VIEW</div>}
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {SHOTS.map((item, index) => (
          <button key={item.title} type="button" onClick={() => setShot(index)} className={`rounded-full border px-4 py-2 text-xs tracking-[0.14em] ${index === shot ? "border-gold text-gold" : "border-white/10 text-muted"}`}>
            {item.title}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ContactSection({ apartment }: { apartment: Apartment | null }) {
  return (
    <section id="contact" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:px-8">
      <div>
        <p className="text-[11px] tracking-[0.28em] text-gold">CONTACT</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Ask the residence desk.</h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted">
          Leave a name and a way to reply. If you have a residence open, its number, floor, area and price travel with the request. Notifications can be forwarded to Telegram when the server is configured.
        </p>
        <p className="mt-8 text-xs tracking-[0.16em] text-muted">
          <a href="/admin" className="underline decoration-white/20 underline-offset-4">Staff desk</a>
        </p>
      </div>
      <BookingForm apartment={apartment} variant="section" />
    </section>
  );
}

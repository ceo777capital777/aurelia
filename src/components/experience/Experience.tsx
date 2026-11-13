"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { apartmentsOnFloor, getBuildingStats, getFloorSpecs, getSeedApartments, type Apartment } from "@/data/building";
import { formatAED } from "@/lib/format";
import { cameraCommands } from "../scene/BuildingControls";
import { debugState, publishDebug } from "../scene/debug";
import { MainScene } from "../scene/MainScene";
import type { Quality, TimeOfDay, ViewMode } from "../scene/types";
import { walkInput } from "../scene/walkInput";
import { WalkOverlay } from "../scene/WalkController";
import { ApartmentInfo } from "../ui/ApartmentInfo";
import { ApartmentList } from "../scene/ApartmentSelector";
import { BookingForm } from "../ui/BookingForm";
import { FloorSelector } from "../ui/FloorSelector";
import { Loader } from "../ui/Loader";
import { Navigation } from "../ui/Navigation";
import { AboutSection, AmenitiesSection, ContactSection, GallerySection, LocationSection } from "../ui/Sections";

export default function Experience() {
  const [ready, setReady] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [quality, setQuality] = useState<Quality>("high");
  const [mobile, setMobile] = useState(false);
  const [mode, setMode] = useState<ViewMode>("building");
  const [floor, setFloor] = useState<number | null>(null);
  const [apartmentId, setApartmentId] = useState<string | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
  const [hoveredApt, setHoveredApt] = useState<string | null>(null);
  const [time, setTime] = useState<TimeOfDay>("day");
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>(() => getSeedApartments());
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 840;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    setMobile(coarse || window.matchMedia("(pointer: coarse)").matches);
    if (coarse || cores <= 4 || memory <= 4) setQuality("low");
    setReady(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      gsap.from("[data-reveal]", { y: 16, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out", delay: 0.2 });
    }
    const load = () => {
      fetch("/api/apartments")
        .then((response) => response.json())
        .then((data: { apartments?: Apartment[] }) => {
          if (data.apartments?.length) setApartments(data.apartments);
        })
        .catch(() => undefined);
    };
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    debugState.mode = mode;
    debugState.floor = floor;
    debugState.apartmentId = apartmentId;
    publishDebug();
    document.body.style.overflow = mode === "building" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mode, floor, apartmentId]);

  useEffect(() => {
    walkInput.paused = bookingOpen;
  }, [bookingOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (bookingOpen) {
        setBookingOpen(false);
        return;
      }
      if (mode === "walk") {
        setMode("floor");
        return;
      }
      if (mode === "floor") {
        setMode("building");
        setFloor(null);
        setApartmentId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookingOpen, mode]);

  const stats = useMemo(() => getBuildingStats(apartments), [apartments]);
  const floorSpec = floor ? getFloorSpecs().find((item) => item.floor === floor) ?? null : null;
  const apartment = apartments.find((item) => item.id === apartmentId) ?? null;
  const floorUnits = floor ? apartmentsOnFloor(apartments, floor) : [];

  const selectFloor = (value: number) => {
    setFloor(value);
    setMode("floor");
    setApartmentId(null);
    setHoveredApt(null);
    setSelectorOpen(true);
    setAutoRotate(false);
    setBookingOpen(false);
  };

  const backToBuilding = () => {
    setMode("building");
    setFloor(null);
    setApartmentId(null);
    setBookingOpen(false);
  };

  return (
    <div className="bg-ink text-white">
      <section
        id="residence"
        ref={heroRef}
        className={mode === "building" ? "relative h-[100svh] overflow-hidden" : "fixed inset-0 z-30 h-[100svh] overflow-hidden bg-ink"}
      >
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(8,10,13,0.72)_100%)]" />
        <div className="absolute inset-0" data-testid="hero-canvas">
          {ready && (
            <MainScene
              mode={mode}
              floorSpec={floorSpec}
              apartment={apartment}
              apartments={apartments}
              hoveredFloor={hoveredFloor}
              selectedFloor={mode === "floor" ? floor : null}
              hoveredApt={hoveredApt}
              selectedApt={apartmentId}
              time={time}
              quality={quality}
              autoRotate={autoRotate && mode === "building"}
              rendering={mode !== "building" || heroVisible}
              onReady={() => setWebglReady(true)}
              onLowQuality={() => setQuality("low")}
              onHoverFloor={setHoveredFloor}
              onSelectFloor={selectFloor}
              onHoverApt={setHoveredApt}
              onSelectApt={(id) => {
                setApartmentId(id);
                setBookingOpen(false);
              }}
              onUserInteract={() => setAutoRotate(false)}
            />
          )}
        </div>
        {!webglReady && <Loader label="Preparing the residence" />}
        <div className="pointer-events-none relative z-10 flex h-full flex-col">
          <Navigation exploring={mode !== "building"} onBack={backToBuilding} />
          {mode === "building" && (
            <>
              <div className="flex flex-1 items-end justify-between gap-4 px-4 pb-28 md:items-center md:px-8 md:pb-0">
                <div className="glass max-w-sm rounded-3xl p-5" data-reveal>
                  <p className="text-[11px] tracking-[0.32em] text-gold">DUBAI, UAE</p>
                  <h1 className="mt-3 font-serif text-4xl leading-none md:text-6xl">Aurelia Residence</h1>
                  <p className="mt-4 max-w-xs text-sm leading-6 text-white/80">
                    A private glass tower above Business Bay. Rotate the model, open a floor, and walk the residence.
                  </p>
                </div>
                <div className="glass hidden max-w-[240px] rounded-3xl p-5 text-right md:block" data-reveal>
                  <Stat value="35" label="Floors" />
                  <Stat value={String(stats.apartments)} label="Residences" />
                  <Stat value={String(stats.available)} label="Available" />
                  <Stat value={formatAED(stats.startingPrice)} label="Starting price" />
                  <p className="mt-3 text-[10px] tracking-[0.16em] text-muted">4 PARKING LEVELS BELOW GRADE</p>
                </div>
              </div>
              <div className="pointer-events-auto absolute bottom-6 left-1/2 flex w-[min(92vw,40rem)] -translate-x-1/2 flex-col items-center gap-3">
                <p className="text-[10px] tracking-[0.28em] text-white/70 md:hidden">
                  {stats.apartments} residences · {stats.available} available · from {formatAED(stats.startingPrice)}
                </p>
                <button
                  type="button"
                  data-testid="explore-building"
                  onClick={() => {
                    setSelectorOpen(true);
                    setAutoRotate(true);
                  }}
                  className="rounded-full bg-white px-6 py-3 text-xs tracking-[0.2em] text-ink"
                >
                  EXPLORE BUILDING
                </button>
                <p className="text-[10px] tracking-[0.22em] text-muted">ROTATE TO EXPLORE</p>
              </div>
            </>
          )}
          <FloorSelector open={selectorOpen && mode !== "walk"} floor={floor} onSelect={selectFloor} />
          {mode === "floor" && floor && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(92vw,46rem)] -translate-x-1/2">
              <p className="mb-2 text-center text-[10px] tracking-[0.22em] text-gold">
                FLOOR {String(floor).padStart(2, "0")}
                {floorUnits.length ? ` · ${floorUnits.length} RESIDENCES` : " · AMENITY"}
              </p>
              <ApartmentList apartments={apartments} floor={floor} selectedId={apartmentId} onSelect={setApartmentId} />
            </div>
          )}
          <AnimatePresence>
            {mode === "floor" && apartment && (
              <ApartmentInfo
                key={apartment.id}
                apartment={apartment}
                onEnter={() => {
                  debugState.moved = false;
                  debugState.collided = false;
                  debugState.blockedMoves = 0;
                  setMode("walk");
                  setBookingOpen(false);
                }}
                onInterest={() => setBookingOpen(true)}
                onClose={() => setApartmentId(null)}
              />
            )}
          </AnimatePresence>
          {mode === "walk" && (
            <WalkOverlay mobile={mobile} onExit={() => setMode("floor")} onInterest={() => setBookingOpen(true)} />
          )}
          {bookingOpen && mode !== "building" && <BookingForm apartment={apartment} onClose={() => setBookingOpen(false)} />}
          <div className="pointer-events-auto absolute right-4 top-20 z-20 flex flex-col gap-2 md:right-8">
            <button type="button" className="glass h-10 w-10 rounded-full text-sm" onClick={() => { cameraCommands.zoom = 1; }} aria-label="Zoom in">+</button>
            <button type="button" className="glass h-10 w-10 rounded-full text-sm" onClick={() => { cameraCommands.zoom = -1; }} aria-label="Zoom out">−</button>
            <button
              type="button"
              className="glass h-10 rounded-full px-3 text-[10px] tracking-[0.14em]"
              onClick={() => setTime((value) => (value === "day" ? "evening" : "day"))}
            >
              {time === "day" ? "DAY" : "DUSK"}
            </button>
            {mode === "building" && (
              <button type="button" className="glass h-10 rounded-full px-3 text-[10px] tracking-[0.14em]" onClick={() => { cameraCommands.reset = 1; setAutoRotate(false); }}>
                RESET
              </button>
            )}
          </div>
        </div>
      </section>
      {mode === "building" && (
        <>
          <AboutSection apartments={apartments} />
          <AmenitiesSection />
          <LocationSection />
          <GallerySection />
          <ContactSection apartment={apartment} />
          <footer className="px-5 py-10 text-center text-[11px] tracking-[0.16em] text-muted">
            AURELIA RESIDENCE · FICTIONAL DEMONSTRATION · BUSINESS BAY
          </footer>
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-white/10 py-3">
      <p className="font-serif text-2xl text-white">{value}</p>
      <p className="text-[10px] tracking-[0.18em] text-muted">{label.toUpperCase()}</p>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { debugState } from "./debug";
import {
  EYE_HEIGHT,
  INTERIOR_BOUNDS,
  PLAYER_RADIUS,
  blocked,
  getColliders,
  type Aabb,
} from "./interiorLayout";
import { walkInput, walkKeys } from "./walkInput";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function WalkController({ bedrooms, active }: { bedrooms: number; active: boolean }) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-0.08);
  const position = useRef(new THREE.Vector3(0, EYE_HEIGHT, -2.05));
  const colliders = useRef<Aabb[]>([]);
  const bob = useRef(0);

  useEffect(() => {
    colliders.current = getColliders(bedrooms);
  }, [bedrooms]);

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const previousFov = perspective.fov;
    perspective.fov = 58;
    perspective.updateProjectionMatrix();
    camera.position.copy(position.current);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    const element = gl.domElement;

    const onMouse = (event: MouseEvent) => {
      if (document.pointerLockElement === element) {
        walkInput.lookX += event.movementX;
        walkInput.lookY += event.movementY;
      }
    };
    const onDown = (event: PointerEvent) => {
      if (walkInput.paused || event.button !== 0) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      element.requestPointerLock?.();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      walkKeys[event.code] = true;
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      walkKeys[event.code] = false;
    };
    window.addEventListener("mousemove", onMouse);
    element.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("mousemove", onMouse);
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (document.pointerLockElement === element) document.exitPointerLock();
      perspective.fov = previousFov;
      perspective.updateProjectionMatrix();
      camera.rotation.set(0, 0, 0);
      camera.up.set(0, 1, 0);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    if (!active) return;
    const dt = Math.min(Math.max(delta, 0), 2);
    yaw.current -= walkInput.lookX * 0.0022;
    pitch.current = clamp(pitch.current - walkInput.lookY * 0.0022, -1.15, 1.15);
    walkInput.lookX = 0;
    walkInput.lookY = 0;
    if (walkKeys.ArrowLeft) yaw.current += 1.4 * dt;
    if (walkKeys.ArrowRight) yaw.current -= 1.4 * dt;
    if (walkKeys.ArrowUp) pitch.current = clamp(pitch.current + 1.1 * dt, -1.15, 1.15);
    if (walkKeys.ArrowDown) pitch.current = clamp(pitch.current - 1.1 * dt, -1.15, 1.15);

    if (!walkInput.paused) {
      let forward = 0;
      let strafe = 0;
      if (walkKeys.KeyW) forward += 1;
      if (walkKeys.KeyS) forward -= 1;
      if (walkKeys.KeyD) strafe += 1;
      if (walkKeys.KeyA) strafe -= 1;
      forward += walkInput.joyY;
      strafe += walkInput.joyX;
      const sprint = Boolean(walkKeys.ShiftLeft || walkKeys.ShiftRight);
      const length = Math.hypot(forward, strafe);
      if (length > 0.001) {
        forward /= length;
        strafe /= length;
        const sin = Math.sin(yaw.current);
        const cos = Math.cos(yaw.current);
        const velocity = (sprint ? 4.5 : 2.35) * Math.min(length, 1);
        let remaining = dt;
        while (remaining > 0.0001) {
          const step = Math.min(1 / 60, remaining);
          remaining -= step;
          const dx = (sin * forward + cos * strafe) * velocity * step;
          const dz = (-cos * forward + sin * strafe) * velocity * step;
          const nextX = position.current.x + dx;
          const nextZ = position.current.z + dz;
          if (!blocked(nextX, position.current.z, colliders.current, PLAYER_RADIUS)) position.current.x = nextX;
          else if (Math.abs(dx) > 0.0001) {
            debugState.collided = true;
            debugState.blockedMoves += 1;
          }
          if (!blocked(position.current.x, nextZ, colliders.current, PLAYER_RADIUS)) position.current.z = nextZ;
          else if (Math.abs(dz) > 0.0001) {
            debugState.collided = true;
            debugState.blockedMoves += 1;
          }
          if (Math.abs(dx) + Math.abs(dz) > 0.0001) debugState.moved = true;
        }
        bob.current += Math.min(dt, 0.28) * (sprint ? 10 : 7);
      }
      position.current.x = clamp(position.current.x, INTERIOR_BOUNDS.minX, INTERIOR_BOUNDS.maxX);
      position.current.z = clamp(position.current.z, INTERIOR_BOUNDS.minZ, INTERIOR_BOUNDS.maxZ);
    }

    camera.position.set(position.current.x, EYE_HEIGHT + Math.sin(bob.current) * 0.012, position.current.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = 0;
    debugState.player = { x: position.current.x, y: EYE_HEIGHT, z: position.current.z };
  });

  return null;
}

export function WalkOverlay({
  onExit,
  onInterest,
  mobile,
}: {
  onExit: () => void;
  onInterest: () => void;
  mobile: boolean;
}) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  const moveStick = (clientX: number, clientY: number) => {
    if (!origin.current) return;
    const dx = clientX - origin.current.x;
    const dy = clientY - origin.current.y;
    const max = 46;
    walkInput.joyX = clamp(dx / max, -1, 1);
    walkInput.joyY = clamp(-dy / max, -1, 1);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="pointer-events-auto absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-ink/70 px-4 py-2 text-[11px] tracking-[0.18em] text-white/80">
        <span data-testid="walk-hint">{mobile ? "DRAG TO LOOK" : "WASD · MOUSE · SHIFT · ESC"}</span>
      </div>
      <button
        type="button"
        data-testid="exit-walk"
        onClick={onExit}
        className="pointer-events-auto absolute right-4 top-4 z-30 rounded-full border border-white/15 bg-panel/85 px-4 py-2 text-xs tracking-[0.16em] text-white"
      >
        EXIT
      </button>
      <button
        type="button"
        onClick={onInterest}
        className="pointer-events-auto absolute bottom-6 right-4 z-30 rounded-full bg-gold px-4 py-3 text-xs tracking-[0.14em] text-ink md:bottom-8"
      >
        INTERESTED IN THIS APARTMENT
      </button>
      {mobile && (
        <>
          <div
            className="pointer-events-auto absolute bottom-8 left-6 h-28 w-28 rounded-full border border-white/20 bg-white/5"
            onPointerDown={(event) => {
              origin.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => moveStick(event.clientX, event.clientY)}
            onPointerUp={() => {
              origin.current = null;
              walkInput.joyX = 0;
              walkInput.joyY = 0;
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/90"
              style={{ transform: `translate(calc(-50% + ${walkInput.joyX * 36}px), calc(-50% + ${-walkInput.joyY * 36}px))` }}
            />
          </div>
          <div
            className="pointer-events-auto absolute bottom-24 right-0 top-16 w-1/2"
            style={{ touchAction: "none" }}
            onPointerDown={(event) => {
              origin.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!origin.current) return;
              walkInput.lookX += event.clientX - origin.current.x;
              walkInput.lookY += event.clientY - origin.current.y;
              origin.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={() => {
              origin.current = null;
            }}
          />
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { TimeOfDay } from "./types";

const skyVertex = `
  varying vec3 vPos;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const skyFragment = `
  varying vec3 vPos;
  uniform vec3 top;
  uniform vec3 mid;
  uniform vec3 bottom;
  void main() {
    float h = normalize(vPos).y;
    vec3 color = mix(mid, top, smoothstep(0.02, 0.42, h));
    color = mix(bottom, color, smoothstep(-0.08, 0.1, h));
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function SkyRig({ time, exposure = 1 }: { time: TimeOfDay; exposure?: number }) {
  const { gl, scene } = useThree();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color(time === "day" ? "#3f6d9a" : "#070910") },
          mid: { value: new THREE.Color(time === "day" ? "#e8c7a2" : "#d8874e") },
          bottom: { value: new THREE.Color(time === "day" ? "#8d7b68" : "#120e0c") },
        },
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
      }),
    [time],
  );

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);

  useEffect(() => {
    const envScene = new THREE.Scene();
    const envMat = material.clone();
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(40, 20, 14), envMat));
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(3.4, 16, 12),
      new THREE.MeshBasicMaterial({ color: time === "day" ? "#fff6e4" : "#ff9b4a" }),
    );
    sun.position.set(time === "day" ? 18 : -16, time === "day" ? 16 : 5, 10);
    envScene.add(sun);
    const pmrem = new THREE.PMREMGenerator(gl);
    let envMap: THREE.Texture | null = null;
    try {
      envMap = pmrem.fromScene(envScene, 0.045).texture;
      scene.environment = envMap;
    } catch {
      envMap = null;
    }
    return () => {
      if (envMap && scene.environment === envMap) scene.environment = null;
      envMap?.dispose();
      pmrem.dispose();
      envMat.dispose();
    };
  }, [gl, scene, time, material]);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh frustumCulled={false} scale={900}>
      <sphereGeometry args={[1, 32, 20]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function Lights({
  time,
  interior,
  quality,
}: {
  time: TimeOfDay;
  interior: boolean;
  quality: "high" | "low";
}) {
  if (interior) {
    return (
      <>
        <hemisphereLight args={["#d7e4f1", "#2c261f", 0.38]} />
        <ambientLight intensity={0.18} />
        <directionalLight
          position={[4, 10, -14]}
          intensity={time === "day" ? 1.7 : 0.32}
          color={time === "day" ? "#fff1df" : "#9eb6dd"}
          castShadow={quality === "high"}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={40}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
      </>
    );
  }

  return (
    <>
      <hemisphereLight args={[time === "day" ? "#d7e7f6" : "#24344e", time === "day" ? "#c2b5a4" : "#120e0c", time === "day" ? 0.5 : 0.2]} />
      <ambientLight intensity={time === "day" ? 0.22 : 0.06} />
      <directionalLight
        position={time === "day" ? [80, 140, 64] : [-130, 36, -24]}
        intensity={time === "day" ? 2.35 : 0.48}
        color={time === "day" ? "#fff3e2" : "#ffb27a"}
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={10}
        shadow-camera-far={380}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={140}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-40, 30, -20]} intensity={0.28} color="#C5A46D" />
    </>
  );
}

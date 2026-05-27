"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { Suspense } from "react";
import { PouchModel } from "./pouch-model";

export default function PouchViewer() {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 2.8,
        outputColorSpace: SRGBColorSpace,
        powerPreference: "high-performance",
      }}
      dpr={[1, 2]}
      camera={{
        fov: 10,
        position: [0, 0, 10],
        near: 0.1,
        far: 30,
      }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Environment resolution={1024} frames={1}>
          <Lightformer
            form="rect"
            intensity={6.0}
            color="#fff5e8"
            scale={[7, 4, 1]}
            position={[-3, 3, 2]}
            rotation={[0.1, 0.6, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            color="#dde4ff"
            scale={[4, 3, 1]}
            position={[4, 1, 2]}
            rotation={[0, -0.7, 0]}
          />
          <Lightformer
            form="rect"
            intensity={9.0}
            color="#ffffff"
            scale={[12, 0.25, 1]}
            position={[0, 3, -5]}
          />
          <Lightformer
            form="rect"
            intensity={4.0}
            color="#ffffff"
            scale={[8, 6, 1]}
            position={[0, 7, -1]}
            rotation={[Math.PI / 2.2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={0.6}
            color="#f5efe8"
            scale={[10, 5, 1]}
            position={[0, -5, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="circle"
            intensity={12.0}
            color="#ffffff"
            scale={0.5}
            position={[-1.5, 3, 4]}
          />
          <Lightformer
            form="circle"
            intensity={5.0}
            color="#ffffff"
            scale={0.3}
            position={[2.5, 2, 3]}
          />
          <Lightformer
            form="rect"
            intensity={0.1}
            color="#1a1a1a"
            scale={[5, 6, 1]}
            position={[3, 0, -2]}
            rotation={[0, -0.4, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.0}
            color="#e8e8e8"
            scale={[6, 4, 1]}
            position={[-2, 0, -4]}
            rotation={[0, 0.3, 0]}
          />
        </Environment>

        <group position={[0, -0.49, 0]} rotation={[0.1, -0.3, 0]}>
          <Float
            speed={1.2}
            rotationIntensity={0.1}
            floatIntensity={0.15}
            floatingRange={[-0.02, 0.02]}
          >
            <PouchModel />
          </Float>
        </group>

        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.2}
          scale={3.5}
          blur={2.3}
          far={2}
          color="#666666"
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={1.8}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />

    </Canvas>
  );
}

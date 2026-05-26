"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const SOURCE_IMAGE = "/hero-particle-source.png";
const PARTICLE_COUNT = 90000;
const SAMPLE_SIZE = 640;

type ParticleSettings = {
  vignetteIntensity: number;
  chromaticStrength: number;
  pointSize: number;
  fbmAmplitude: number;
  fbmFrequency: number;
  fbmSpeed: number;
  curlStrength: number;
  breathingAmplitude: number;
  lutIntensity: number;
};

type ParticleData = {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  randomness: Float32Array;
};

const DEFAULT_SETTINGS: ParticleSettings = {
  vignetteIntensity: 0.4,
  chromaticStrength: 1.5,
  pointSize: 4,
  fbmAmplitude: 1,
  fbmFrequency: 1,
  fbmSpeed: 1,
  curlStrength: 0.15,
  breathingAmplitude: 0.05,
  lutIntensity: 0.5,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smooth(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function random(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

async function loadParticleData(src: string): Promise<ParticleData> {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Could not read particle source image.");

  context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const pixels = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
  const candidates: number[] = [];

  for (let y = 0; y < SAMPLE_SIZE; y += 2) {
    for (let x = 0; x < SAMPLE_SIZE; x += 2) {
      const i = (y * SAMPLE_SIZE + x) * 4;
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;

      if (luma < 16) continue;
      candidates.push(i);
    }
  }

  const count = Math.min(PARTICLE_COUNT, candidates.length);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const randomness = new Float32Array(count * 3);
  const stride = Math.max(1, Math.floor(candidates.length / count));

  for (let i = 0; i < count; i++) {
    const jitter = Math.floor(random(i + 1.2) * stride);
    const pixelIndex = candidates[(i * stride + jitter) % candidates.length] ?? 0;
    const pixel = pixelIndex / 4;
    const x = pixel % SAMPLE_SIZE;
    const y = Math.floor(pixel / SAMPLE_SIZE);
    const i3 = i * 3;
    const rx = random(i * 10.1 + 1);
    const ry = random(i * 13.7 + 2);
    const rz = random(i * 17.3 + 3);

    positions[i3] = (x / SAMPLE_SIZE - 0.5) * 12;
    positions[i3 + 1] = (0.5 - y / SAMPLE_SIZE) * 12;
    positions[i3 + 2] = (rz - 0.5) * 0.45;

    colors[i3] = (pixels[pixelIndex] ?? 0) / 255;
    colors[i3 + 1] = (pixels[pixelIndex + 1] ?? 0) / 255;
    colors[i3 + 2] = (pixels[pixelIndex + 2] ?? 0) / 255;

    scales[i] = 0.65 + random(i * 23.9) * 0.85;
    randomness[i3] = rx;
    randomness[i3 + 1] = ry;
    randomness[i3 + 2] = rz;
  }

  return { positions, colors, scales, randomness };
}

function ParticleImage({
  data,
  progress,
  settings,
}: {
  data: ParticleData;
  progress: number;
  settings: ParticleSettings;
}) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const { viewport, gl } = useThree();

  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    next.setAttribute("aColor", new THREE.BufferAttribute(data.colors, 3));
    next.setAttribute("aScale", new THREE.BufferAttribute(data.scales, 1));
    next.setAttribute("aRandomness", new THREE.BufferAttribute(data.randomness, 3));
    next.computeBoundingSphere();
    return next;
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 12 },
          uOpacity: { value: 0.95 },
          uPixelRatio: { value: 1 },
          uFbmAmplitude: { value: settings.fbmAmplitude },
          uFbmFrequency: { value: settings.fbmFrequency },
          uFbmSpeed: { value: settings.fbmSpeed },
          uCurlStrength: { value: settings.curlStrength },
          uBreathingAmplitude: { value: settings.breathingAmplitude },
          uLutIntensity: { value: settings.lutIntensity },
          uChromaticStrength: { value: settings.chromaticStrength },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uSize;
          uniform float uPixelRatio;
          uniform float uFbmAmplitude;
          uniform float uFbmFrequency;
          uniform float uFbmSpeed;
          uniform float uCurlStrength;
          uniform float uBreathingAmplitude;
          attribute vec3 aColor;
          attribute float aScale;
          attribute vec3 aRandomness;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vBreathing;

          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }

          float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }

          float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
            for (int i = 0; i < 5; i++) {
              value += amplitude * noise(st);
              st = rot * st * 2.0 + vec2(100.0);
              amplitude *= 0.5;
            }
            return value;
          }

          void main() {
            vec3 p = position;
            vec2 samplePoint = p.xy * 0.22 * uFbmFrequency;
            vec2 flow = vec2(
              fbm(samplePoint + vec2(uTime * 0.18 * uFbmSpeed, aRandomness.x * 3.0)),
              fbm(samplePoint.yx + vec2(aRandomness.y * 3.0, -uTime * 0.16 * uFbmSpeed))
            ) - 0.5;
            vec2 orbit = vec2(
              sin(uTime * 0.72 * uFbmSpeed + aRandomness.x * 18.0),
              cos(uTime * 0.58 * uFbmSpeed + aRandomness.y * 18.0)
            );
            float curl = sin((p.x + p.y) * 0.4 * uFbmFrequency + uTime * uFbmSpeed + aRandomness.z * 6.0);
            vec2 curlDirection = normalize(vec2(-p.y, p.x) + 0.001);
            float breathe = sin(uTime * 0.95 * uFbmSpeed + aRandomness.z * 12.0);

            p.xy += flow * (0.46 * uFbmAmplitude) + orbit * uBreathingAmplitude * 2.1;
            p.xy += curlDirection * curl * uCurlStrength;
            p.z += breathe * uBreathingAmplitude * 4.4;

            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = uSize * aScale * uPixelRatio * (1.0 + breathe * uBreathingAmplitude * 2.8);

            vColor = aColor;
            vAlpha = 0.78 + breathe * uBreathingAmplitude * 2.4;
            vBreathing = breathe;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          uniform float uLutIntensity;
          uniform float uChromaticStrength;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vBreathing;

          void main() {
            float d = length(gl_PointCoord - 0.5);
            float alpha = smoothstep(0.5, 0.18, d) * vAlpha * uOpacity;
            if (alpha < 0.01) discard;
            float fringe = d * uChromaticStrength * 0.045;
            vec3 graded = mix(vColor, pow(vColor, vec3(0.74)) * vec3(1.03, 0.98, 0.92), uLutIntensity);
            vec3 color = vec3(
              clamp(graded.r + fringe, 0.0, 1.0),
              graded.g,
              clamp(graded.b - fringe * 0.65, 0.0, 1.0)
            );
            color *= 1.0 + vBreathing * 0.045;
            gl_FragColor = vec4(color, alpha);
          }
        `,
      }),
    [settings],
  );

  useEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    const eased = smooth(progress);
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2);
      materialRef.current.uniforms.uSize.value = THREE.MathUtils.lerp(settings.pointSize * 1.55, settings.pointSize * 2.45, eased);
      materialRef.current.uniforms.uFbmAmplitude.value = settings.fbmAmplitude;
      materialRef.current.uniforms.uFbmFrequency.value = settings.fbmFrequency;
      materialRef.current.uniforms.uFbmSpeed.value = settings.fbmSpeed;
      materialRef.current.uniforms.uCurlStrength.value = settings.curlStrength;
      materialRef.current.uniforms.uBreathingAmplitude.value = settings.breathingAmplitude;
      materialRef.current.uniforms.uLutIntensity.value = settings.lutIntensity;
      materialRef.current.uniforms.uChromaticStrength.value = settings.chromaticStrength;
    }

    if (pointsRef.current) {
      const coverScale = Math.max(viewport.width / 12, viewport.height / 12);
      pointsRef.current.scale.setScalar(coverScale * THREE.MathUtils.lerp(1.02, 2.85, eased));
      pointsRef.current.position.x = THREE.MathUtils.lerp(0, -1.95, eased);
      pointsRef.current.position.y = THREE.MathUtils.lerp(0, -0.95, eased);
      pointsRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.18) * 0.012;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false} geometry={geometry} material={material} />
  );
}

function ParticleScene({
  progress,
  settings,
}: {
  progress: number;
  settings: ParticleSettings;
}) {
  const [data, setData] = useState<ParticleData | null>(null);

  useEffect(() => {
    let alive = true;
    loadParticleData(SOURCE_IMAGE).then((next) => {
      if (alive) setData(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 100, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      }}
    >
      <color attach="background" args={["#0b0c08"]} />
      {data ? <ParticleImage data={data} progress={progress} settings={settings} /> : null}
    </Canvas>
  );
}

function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid grid-cols-[9rem_1fr_4.75rem] items-center gap-3 text-[#a8adbb]">
      <span>{label}</span>
      <input
        className="h-1.5 accent-[#0a84ff]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <span className="rounded-md bg-[#3b4154] px-3 py-2 text-right tabular-nums">
        {step < 0.1 ? value.toFixed(2) : value.toFixed(1)}
      </span>
    </label>
  );
}

function ControlGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="border-t border-[#2b303b] py-3" open>
      <summary className="cursor-pointer select-none text-lg text-white">{title}</summary>
      <div className="mt-3 space-y-3 pl-4">{children}</div>
    </details>
  );
}

function ParameterPanel({
  settings,
  setSettings,
}: {
  settings: ParticleSettings;
  setSettings: Dispatch<SetStateAction<ParticleSettings>>;
}) {
  const set = (key: keyof ParticleSettings) => (value: number) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="absolute left-4 top-4 z-20 w-[34rem] max-w-[calc(100vw-2rem)] rounded-lg bg-[#161a21]/95 p-4 font-mono text-sm shadow-2xl backdrop-blur">
      <ControlGroup title="Post Processing">
        <ControlGroup title="Vignette">
          <ParameterSlider
            label="Intensity"
            max={1}
            min={0}
            onChange={set("vignetteIntensity")}
            step={0.01}
            value={settings.vignetteIntensity}
          />
        </ControlGroup>
        <ControlGroup title="ChromaticAberration">
          <ParameterSlider
            label="Strength"
            max={4}
            min={0}
            onChange={set("chromaticStrength")}
            step={0.1}
            value={settings.chromaticStrength}
          />
        </ControlGroup>
      </ControlGroup>
      <ControlGroup title="Particles">
        <ParameterSlider
          label="Point Size"
          max={10}
          min={1}
          onChange={set("pointSize")}
          step={0.1}
          value={settings.pointSize}
        />
        <ControlGroup title="FBM">
          <ParameterSlider
            label="Amplitude"
            max={2.5}
            min={0}
            onChange={set("fbmAmplitude")}
            step={0.01}
            value={settings.fbmAmplitude}
          />
          <ParameterSlider
            label="Frequency"
            max={3}
            min={0.2}
            onChange={set("fbmFrequency")}
            step={0.1}
            value={settings.fbmFrequency}
          />
          <ParameterSlider
            label="Speed"
            max={3}
            min={0}
            onChange={set("fbmSpeed")}
            step={0.1}
            value={settings.fbmSpeed}
          />
        </ControlGroup>
        <ControlGroup title="Curl">
          <ParameterSlider
            label="Strength"
            max={0.8}
            min={0}
            onChange={set("curlStrength")}
            step={0.01}
            value={settings.curlStrength}
          />
        </ControlGroup>
        <ControlGroup title="Breathing">
          <ParameterSlider
            label="Amplitude"
            max={0.3}
            min={0}
            onChange={set("breathingAmplitude")}
            step={0.01}
            value={settings.breathingAmplitude}
          />
        </ControlGroup>
        <ControlGroup title="LUT">
          <ParameterSlider
            label="Intensity"
            max={1}
            min={0}
            onChange={set("lutIntensity")}
            step={0.01}
            value={settings.lutIntensity}
          />
        </ControlGroup>
      </ControlGroup>
    </div>
  );
}

export function ParticleHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ParticleSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    function update() {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      setProgress(clamp(-rect.top / scrollable, 0, 1));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[220vh] bg-[#0b0c08]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <ParticleScene progress={progress} settings={settings} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 42%, rgba(0,0,0,${settings.vignetteIntensity}) 100%)`,
          }}
        />
        <ParameterPanel settings={settings} setSettings={setSettings} />
      </div>
    </section>
  );
}

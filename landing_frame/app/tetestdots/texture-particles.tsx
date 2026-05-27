"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import * as THREE from "three";

const SOURCE_IMAGE = "/hero-particle-source.png";
const TEXTURE_SIZE = 256;
const PARTICLE_COUNT = TEXTURE_SIZE * TEXTURE_SIZE;
const BOUNDS_MIN = new THREE.Vector3(-6, -6, -0.5);
const BOUNDS_MAX = new THREE.Vector3(6, 6, 0.5);

type Settings = {
  pointSize: number;
  noiseStrength: number;
  noiseFrequency: number;
  noiseSpeed: number;
  curlStrength: number;
  breathingAmplitude: number;
  attraction: number;
  lutIntensity: number;
  chromaticStrength: number;
  densityInfluence: number;
};

const DEFAULT_SETTINGS: Settings = {
  pointSize: 4.0,
  noiseStrength: 0.5,
  noiseFrequency: 0.8,
  noiseSpeed: 0.6,
  curlStrength: 0.10,
  breathingAmplitude: 0.04,
  attraction: 0.05,
  lutIntensity: 0.3,
  chromaticStrength: 1.2,
  densityInfluence: 0.5,
};

type ParticleTextures = {
  positionH: THREE.DataTexture;
  positionL: THREE.DataTexture;
  color: THREE.DataTexture;
  density: THREE.DataTexture;
};

// ---------------------------------------------------------------------------
// Image -> 16-bit split textures
// ---------------------------------------------------------------------------

async function createParticleTextures(src: string): Promise<ParticleTextures> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(img, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  const pixels = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE).data;

  const count = TEXTURE_SIZE * TEXTURE_SIZE;
  const posHData = new Uint8Array(count * 4);
  const posLData = new Uint8Array(count * 4);
  const colorData = new Uint8Array(count * 4);
  const densityData = new Uint8Array(count * 4);

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const i = y * TEXTURE_SIZE + x;
      const si = i * 4;
      const oi = i * 4;

      const normX = x / (TEXTURE_SIZE - 1);
      const normY = 1.0 - y / (TEXTURE_SIZE - 1);
      const normZ = 0.5;

      const v16x = Math.round(normX * 65535);
      const v16y = Math.round(normY * 65535);
      const v16z = Math.round(normZ * 65535);

      posHData[oi] = (v16x >> 8) & 0xff;
      posHData[oi + 1] = (v16y >> 8) & 0xff;
      posHData[oi + 2] = (v16z >> 8) & 0xff;
      posHData[oi + 3] = 255;

      posLData[oi] = v16x & 0xff;
      posLData[oi + 1] = v16y & 0xff;
      posLData[oi + 2] = v16z & 0xff;
      posLData[oi + 3] = 255;

      const r = pixels[si]!;
      const g = pixels[si + 1]!;
      const b = pixels[si + 2]!;

      colorData[oi] = r;
      colorData[oi + 1] = g;
      colorData[oi + 2] = b;
      colorData[oi + 3] = 255;

      const luma = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);
      densityData[oi] = luma;
      densityData[oi + 1] = 0;
      densityData[oi + 2] = 0;
      densityData[oi + 3] = 255;
    }
  }

  function makeTex(data: Uint8Array): THREE.DataTexture {
    const tex = new THREE.DataTexture(
      data,
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      THREE.RGBAFormat,
    );
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }

  return {
    positionH: makeTex(posHData),
    positionL: makeTex(posLData),
    color: makeTex(colorData),
    density: makeTex(densityData),
  };
}

// ---------------------------------------------------------------------------
// GLSL — shared noise helpers
// ---------------------------------------------------------------------------

const GLSL_NOISE = /* glsl */ `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.0 + vec2(100.0);
      a *= 0.5;
    }
    return v;
  }
`;

// ---------------------------------------------------------------------------
// GLSL — FBO simulation shaders
// ---------------------------------------------------------------------------

const SIM_VERTEX = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const SIM_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uPositions;
  uniform sampler2D uOriginPosH;
  uniform sampler2D uOriginPosL;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uDelta;
  uniform vec3 uBoundsMin;
  uniform vec3 uBoundsMax;
  uniform float uNoiseStrength;
  uniform float uNoiseFrequency;
  uniform float uNoiseSpeed;
  uniform float uCurlStrength;
  uniform float uAttraction;
  uniform float uIsInit;

  ${GLSL_NOISE}

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    // === 16-BIT POSITION RECONSTRUCTION ===
    vec3 posH = texture2D(uOriginPosH, uv).rgb * 255.0;
    vec3 posL = texture2D(uOriginPosL, uv).rgb * 255.0;
    vec3 pos16 = posH * 256.0 + posL;
    vec3 origin = (pos16 / 65535.0) * (uBoundsMax - uBoundsMin) + uBoundsMin;

    if (uIsInit > 0.5) {
      gl_FragColor = vec4(origin, 1.0);
      return;
    }

    vec3 pos = texture2D(uPositions, uv).xyz;

    // FBM flow field
    vec2 np = pos.xy * 0.15 * uNoiseFrequency;
    float n1 = fbm(np + vec2(uTime * 0.12 * uNoiseSpeed, 0.0));
    float n2 = fbm(np.yx + vec2(0.0, uTime * 0.10 * uNoiseSpeed) + 50.0);
    vec2 flow = (vec2(n1, n2) - 0.5) * uNoiseStrength;

    // Curl-like force
    float curl = sin((pos.x + pos.y) * 0.3 * uNoiseFrequency + uTime * uNoiseSpeed);
    vec2 curlDir = normalize(vec2(-pos.y, pos.x) + 0.001);

    // Attraction to origin
    vec3 toOrigin = origin - pos;

    float dt = min(uDelta, 0.05);
    pos.xy += flow * dt * 8.0;
    pos.xy += curlDir * curl * uCurlStrength * dt * 6.0;
    pos += toOrigin * uAttraction;

    gl_FragColor = vec4(pos, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// GLSL — particle render shaders
// ---------------------------------------------------------------------------

const PARTICLE_VERTEX = /* glsl */ `
  uniform sampler2D uPositions;
  uniform sampler2D uColors;
  uniform sampler2D uDensity;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uDensityInfluence;
  uniform float uBreathingAmplitude;

  attribute vec2 aParticleUv;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vBreathing;

  void main() {
    vec3 pos = texture2D(uPositions, aParticleUv).xyz;
    vec3 color = texture2D(uColors, aParticleUv).rgb;
    float density = texture2D(uDensity, aParticleUv).r;

    float seed = aParticleUv.x * 127.1 + aParticleUv.y * 311.7;
    float breathe = sin(uTime * 0.95 + seed * 6.283);
    pos.z += breathe * uBreathingAmplitude * 2.0;

    float densityScale = mix(1.0, 0.3 + density * 0.7, uDensityInfluence);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = uSize * densityScale * uPixelRatio * (1.0 + breathe * uBreathingAmplitude);

    vColor = color * 1.3;
    vAlpha = 0.65 + density * 0.35;
    vBreathing = breathe;
  }
`;

const PARTICLE_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  uniform float uLutIntensity;
  uniform float uChromaticStrength;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vBreathing;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.15, d) * vAlpha * uOpacity;
    if (alpha < 0.01) discard;

    float fringe = d * uChromaticStrength * 0.04;
    vec3 graded = mix(
      vColor,
      pow(vColor, vec3(0.74)) * vec3(1.03, 0.98, 0.92),
      uLutIntensity
    );
    vec3 color = vec3(
      clamp(graded.r + fringe, 0.0, 1.0),
      graded.g,
      clamp(graded.b - fringe * 0.65, 0.0, 1.0)
    );
    color *= 1.0 + vBreathing * 0.04;
    float glow = smoothstep(0.35, 0.0, d) * 0.15;
    color += glow;
    gl_FragColor = vec4(color, alpha);
  }
`;

// ---------------------------------------------------------------------------
// GPGPU particle system component
// ---------------------------------------------------------------------------

function GPGPUParticles({
  textures,
  settings,
}: {
  textures: ParticleTextures;
  settings: Settings;
}) {
  const { gl, viewport } = useThree();
  const pointsRef = useRef<THREE.Points | null>(null);
  const fboRef = useRef<{
    read: THREE.WebGLRenderTarget;
    write: THREE.WebGLRenderTarget;
    initialized: boolean;
  } | null>(null);

  const { simScene, simCamera, simMaterial } = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPositions: { value: null },
        uOriginPosH: { value: textures.positionH },
        uOriginPosL: { value: textures.positionL },
        uResolution: {
          value: new THREE.Vector2(TEXTURE_SIZE, TEXTURE_SIZE),
        },
        uTime: { value: 0 },
        uDelta: { value: 0 },
        uBoundsMin: { value: BOUNDS_MIN },
        uBoundsMax: { value: BOUNDS_MAX },
        uNoiseStrength: { value: settings.noiseStrength },
        uNoiseFrequency: { value: settings.noiseFrequency },
        uNoiseSpeed: { value: settings.noiseSpeed },
        uCurlStrength: { value: settings.curlStrength },
        uAttraction: { value: settings.attraction },
        uIsInit: { value: 1.0 },
      },
      vertexShader: SIM_VERTEX,
      fragmentShader: SIM_FRAGMENT,
      depthWrite: false,
      depthTest: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);
    return { simScene: scene, simCamera: camera, simMaterial: material };
  }, [textures]);

  const { geometry, particleMaterial } = useMemo(() => {
    const count = TEXTURE_SIZE * TEXTURE_SIZE;
    const uvs = new Float32Array(count * 2);
    const dummyPositions = new Float32Array(count * 3);

    for (let y = 0; y < TEXTURE_SIZE; y++) {
      for (let x = 0; x < TEXTURE_SIZE; x++) {
        const i = y * TEXTURE_SIZE + x;
        uvs[i * 2] = (x + 0.5) / TEXTURE_SIZE;
        uvs[i * 2 + 1] = (y + 0.5) / TEXTURE_SIZE;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(dummyPositions, 3));
    geo.setAttribute("aParticleUv", new THREE.BufferAttribute(uvs, 2));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uPositions: { value: null },
        uColors: { value: textures.color },
        uDensity: { value: textures.density },
        uTime: { value: 0 },
        uSize: { value: settings.pointSize },
        uOpacity: { value: 0.92 },
        uPixelRatio: { value: 1 },
        uDensityInfluence: { value: settings.densityInfluence },
        uBreathingAmplitude: { value: settings.breathingAmplitude },
        uLutIntensity: { value: settings.lutIntensity },
        uChromaticStrength: { value: settings.chromaticStrength },
      },
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
    });

    return { geometry: geo, particleMaterial: mat };
  }, [textures]);

  useEffect(() => {
    const rtParams: THREE.RenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    };
    const a = new THREE.WebGLRenderTarget(
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      rtParams,
    );
    const b = new THREE.WebGLRenderTarget(
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      rtParams,
    );
    fboRef.current = { read: a, write: b, initialized: false };

    return () => {
      a.dispose();
      b.dispose();
    };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      particleMaterial.dispose();
      simMaterial.dispose();
    };
  }, [geometry, particleMaterial, simMaterial]);

  useFrame((state, frameDelta) => {
    const fbo = fboRef.current;
    if (!fbo) return;

    const t = state.clock.getElapsedTime();
    const dt = Math.min(frameDelta, 0.05);

    // Update simulation uniforms
    simMaterial.uniforms.uPositions.value = fbo.read.texture;
    simMaterial.uniforms.uTime.value = t;
    simMaterial.uniforms.uDelta.value = dt;
    simMaterial.uniforms.uNoiseStrength.value = settings.noiseStrength;
    simMaterial.uniforms.uNoiseFrequency.value = settings.noiseFrequency;
    simMaterial.uniforms.uNoiseSpeed.value = settings.noiseSpeed;
    simMaterial.uniforms.uCurlStrength.value = settings.curlStrength;
    simMaterial.uniforms.uAttraction.value = settings.attraction;

    if (!fbo.initialized) {
      simMaterial.uniforms.uIsInit.value = 1.0;
    }

    // Run simulation to write FBO
    gl.setRenderTarget(fbo.write);
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);

    // Swap
    const temp = fbo.read;
    fbo.read = fbo.write;
    fbo.write = temp;

    if (!fbo.initialized) {
      simMaterial.uniforms.uIsInit.value = 0.0;
      fbo.initialized = true;
    }

    // Update particle uniforms
    particleMaterial.uniforms.uPositions.value = fbo.read.texture;
    particleMaterial.uniforms.uTime.value = t;
    particleMaterial.uniforms.uPixelRatio.value = Math.min(
      gl.getPixelRatio(),
      2,
    );
    particleMaterial.uniforms.uSize.value = settings.pointSize;
    particleMaterial.uniforms.uDensityInfluence.value =
      settings.densityInfluence;
    particleMaterial.uniforms.uBreathingAmplitude.value =
      settings.breathingAmplitude;
    particleMaterial.uniforms.uLutIntensity.value = settings.lutIntensity;
    particleMaterial.uniforms.uChromaticStrength.value =
      settings.chromaticStrength;

    if (pointsRef.current) {
      const coverScale = Math.max(viewport.width / 12, viewport.height / 12);
      pointsRef.current.scale.setScalar(coverScale);
      pointsRef.current.rotation.z = Math.sin(t * 0.15) * 0.015;
    }
  });

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
      geometry={geometry}
      material={particleMaterial}
    />
  );
}

// ---------------------------------------------------------------------------
// Canvas scene
// ---------------------------------------------------------------------------

function ParticleScene({ settings }: { settings: Settings }) {
  const [textures, setTextures] = useState<ParticleTextures | null>(null);

  useEffect(() => {
    let alive = true;
    createParticleTextures(SOURCE_IMAGE).then((t) => {
      if (alive) setTextures(t);
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
      <color attach="background" args={["#0a0a0c"]} />
      {textures ? (
        <GPGPUParticles textures={textures} settings={settings} />
      ) : null}
    </Canvas>
  );
}

// ---------------------------------------------------------------------------
// UI controls
// ---------------------------------------------------------------------------

function Slider({
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
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3 text-[#a8adbb]">
      <span className="truncate">{label}</span>
      <input
        className="h-1.5 accent-[#0a84ff]"
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <span className="rounded-md bg-[#3b4154] px-2 py-1.5 text-right tabular-nums">
        {step < 0.1 ? value.toFixed(2) : value.toFixed(1)}
      </span>
    </label>
  );
}

function Group({
  title,
  children,
  open = true,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="border-t border-[#2b303b] py-3" open={open}>
      <summary className="cursor-pointer select-none text-lg text-white">
        {title}
      </summary>
      <div className="mt-3 space-y-3 pl-4">{children}</div>
    </details>
  );
}

function ControlPanel({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
}) {
  const set =
    (key: keyof Settings) =>
    (v: number) =>
      setSettings((s) => ({ ...s, [key]: v }));

  return (
    <div className="absolute right-4 top-4 z-20 w-[32rem] max-w-[calc(100vw-2rem)] rounded-lg bg-[#161a21]/95 p-4 font-mono text-sm shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs tracking-widest text-[#6b7280] uppercase">
          CloudPoints
        </span>
        <span className="text-xs tabular-nums text-[#6b7280]">
          {PARTICLE_COUNT.toLocaleString()} particles
        </span>
      </div>

      <Group title="Simulation">
        <Slider
          label="Noise Strength"
          min={0}
          max={2}
          step={0.01}
          value={settings.noiseStrength}
          onChange={set("noiseStrength")}
        />
        <Slider
          label="Noise Frequency"
          min={0.1}
          max={3}
          step={0.1}
          value={settings.noiseFrequency}
          onChange={set("noiseFrequency")}
        />
        <Slider
          label="Noise Speed"
          min={0}
          max={2}
          step={0.1}
          value={settings.noiseSpeed}
          onChange={set("noiseSpeed")}
        />
        <Slider
          label="Curl Strength"
          min={0}
          max={0.5}
          step={0.01}
          value={settings.curlStrength}
          onChange={set("curlStrength")}
        />
        <Slider
          label="Attraction"
          min={0.005}
          max={0.2}
          step={0.005}
          value={settings.attraction}
          onChange={set("attraction")}
        />
      </Group>

      <Group title="Particles">
        <Slider
          label="Point Size"
          min={1}
          max={8}
          step={0.1}
          value={settings.pointSize}
          onChange={set("pointSize")}
        />
        <Slider
          label="Breathing"
          min={0}
          max={0.2}
          step={0.01}
          value={settings.breathingAmplitude}
          onChange={set("breathingAmplitude")}
        />
        <Slider
          label="Density Influence"
          min={0}
          max={1}
          step={0.01}
          value={settings.densityInfluence}
          onChange={set("densityInfluence")}
        />
      </Group>

      <Group title="Post Processing" open={false}>
        <Slider
          label="LUT Intensity"
          min={0}
          max={1}
          step={0.01}
          value={settings.lutIntensity}
          onChange={set("lutIntensity")}
        />
        <Slider
          label="Chromatic Aberr."
          min={0}
          max={3}
          step={0.1}
          value={settings.chromaticStrength}
          onChange={set("chromaticStrength")}
        />
      </Group>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metadata overlay
// ---------------------------------------------------------------------------

function MetadataOverlay() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 font-mono text-xs text-[#4b5563]">
      <p>
        {TEXTURE_SIZE}x{TEXTURE_SIZE} = {PARTICLE_COUNT.toLocaleString()}{" "}
        particles
      </p>
      <p>16-bit position (high/low texture split)</p>
      <p>FBO ping-pong simulation</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------

export default function TextureParticles() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  return (
    <>
      <ParticleScene settings={settings} />
      <ControlPanel settings={settings} setSettings={setSettings} />
      <MetadataOverlay />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 42%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
}

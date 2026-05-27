"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";

const SOURCE_IMAGE = "/hero-particle-source.png";
const HEIGHT_MAP_IMAGE = "/hero-particle-sourcebump-map.png";
const PARTICLE_COUNT = 90000;
const SAMPLE_SIZE = 640;

type ParticleData = {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  randomness: Float32Array;
  depths: Float32Array;
  focus: Float32Array;
  blurScales: Float32Array;
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

async function loadDecodedImage(src: string) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await image.decode();
  return image;
}

function sampleImage(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Could not read particle source image.");
  context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  return context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
}

const DEFAULT_FOCUS_DEPTH = 0.62;
const DEFAULT_NEAR_THRESHOLD = 0.68;

async function loadParticleData(src: string): Promise<ParticleData> {
  const [image, heightMap] = await Promise.all([
    loadDecodedImage(src),
    loadDecodedImage(HEIGHT_MAP_IMAGE),
  ]);
  const pixels = sampleImage(image);
  const heightPixels = sampleImage(heightMap);
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
  const depths = new Float32Array(count);
  const focus = new Float32Array(count);
  const blurScales = new Float32Array(count);
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
    const hr = heightPixels[pixelIndex] ?? 0;
    const hg = heightPixels[pixelIndex + 1] ?? 0;
    const hb = heightPixels[pixelIndex + 2] ?? 0;
    const heightLuma = (hr * 0.2126 + hg * 0.7152 + hb * 0.0722) / 255;
    const depth = smooth(heightLuma);
    const near = smooth(
      (depth - DEFAULT_NEAR_THRESHOLD) /
        Math.max(0.001, 1 - DEFAULT_NEAR_THRESHOLD),
    );
    const focusWeight =
      1 - smooth(Math.abs(depth - DEFAULT_FOCUS_DEPTH) / 0.45);

    positions[i3] = (x / SAMPLE_SIZE - 0.5) * 12;
    positions[i3 + 1] = (0.5 - y / SAMPLE_SIZE) * 12;
    positions[i3 + 2] = (rz - 0.5) * 0.16;

    colors[i3] = (pixels[pixelIndex] ?? 0) / 255;
    colors[i3 + 1] = (pixels[pixelIndex + 1] ?? 0) / 255;
    colors[i3 + 2] = (pixels[pixelIndex + 2] ?? 0) / 255;

    scales[i] = 0.65 + random(i * 23.9) * 0.85;
    randomness[i3] = rx;
    randomness[i3 + 1] = ry;
    randomness[i3 + 2] = rz;
    depths[i] = depth;
    focus[i] = focusWeight;
    blurScales[i] =
      near * (1.15 + random(i * 29.7) * 0.65) + (1 - focusWeight) * 0.18;
  }

  return { positions, colors, scales, randomness, depths, focus, blurScales };
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uFbmAmplitude;
  uniform float uFbmFrequency;
  uniform float uFbmSpeed;
  uniform float uCurlStrength;
  uniform float uBreathingAmplitude;
  uniform float uDepthStrength;
  uniform float uFocusDepth;
  uniform float uForegroundBlur;
  uniform float uNearThreshold;
  uniform float uFocusBlur;
  uniform float uPortalRadius;
  uniform float uPortalSoftness;
  uniform float uBrownianStrength;
  uniform float uBrownianSpeed;
  uniform float uSizeMultiplier;

  attribute vec3 aColor;
  attribute float aScale;
  attribute vec3 aRandomness;
  attribute float aDepth;
  attribute float aFocus;
  attribute float aBlurScale;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vBreathing;
  varying float vDepth;
  varying float vFocus;
  varying float vBlurScale;
  varying float vFocusBlur;
  varying float vInsidePortal;

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

    // Portal mask: compute distance from center in normalized space
    vec2 normPos = position.xy / 6.0;
    float distCenter = length(normPos);
    float insidePortal = 1.0 - smoothstep(
      uPortalRadius - uPortalSoftness,
      uPortalRadius + uPortalSoftness,
      distCenter
    );

    // Gentle FBM displacement (existing)
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

    vec2 gentleDisplacement = flow * (0.46 * uFbmAmplitude)
      + orbit * uBreathingAmplitude * 2.1
      + curlDirection * curl * uCurlStrength;

    // Brownian displacement (for inside-portal particles)
    float bt = uTime * uBrownianSpeed * 2.5;
    vec2 bs = position.xy * 0.8 + aRandomness.xy * 7.0;
    float bx = noise(bs + vec2(bt * 1.3, aRandomness.z * 5.0))
             + noise(bs * 3.0 + vec2(-bt * 2.1, 0.0)) * 0.5 - 0.75;
    float by = noise(bs.yx + vec2(aRandomness.z * 5.0, bt * 1.7))
             + noise(bs.yx * 3.0 + vec2(0.0, bt * 1.9)) * 0.5 - 0.75;
    vec2 brownian = vec2(bx, by) * uBrownianStrength * 1.8;
    float walkAngle = noise(vec2(aRandomness.x * 100.0, bt * 0.4)) * 6.2832;
    brownian += vec2(cos(walkAngle), sin(walkAngle)) * uBrownianStrength * 0.6;

    // Blend gentle vs brownian based on portal mask
    p.xy += mix(gentleDisplacement, brownian, insidePortal);
    p.xy += (aRandomness.xy - 0.5) * smoothstep(uNearThreshold, 1.0, aDepth) * clamp(aBlurScale * uForegroundBlur, 0.0, 2.4) * 0.2;
    p.z += (aDepth - 0.5) * uDepthStrength * 2.4;
    p.z += breathe * uBreathingAmplitude * 4.4;

    float nearAmount = smoothstep(uNearThreshold, 1.0, aDepth);
    float focusAmount = mix(1.0 - smoothstep(0.0, 0.55, abs(aDepth - uFocusDepth)), aFocus, 0.15);
    float softBlur = clamp(aBlurScale * uForegroundBlur + (1.0 - focusAmount) * 0.25, 0.0, 2.4);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Focus-dependent point size
    float focusSizeFactor = mix(uSizeMultiplier, 0.6, uFocusBlur);
    float nearScale = 1.0 + nearAmount * 1.65 * (1.0 - uFocusBlur * 0.7) + softBlur * 0.55 * (1.0 - uFocusBlur * 0.5);
    float breatheScale = 1.0 + breathe * uBreathingAmplitude * 2.8;
    gl_PointSize = uSize * aScale * uPixelRatio * focusSizeFactor * nearScale * breatheScale;

    vColor = aColor;
    vAlpha = (0.78 + breathe * uBreathingAmplitude * 2.4) * mix(1.0, 0.56, nearAmount * clamp(softBlur, 0.0, 1.0));
    vBreathing = breathe;
    vDepth = aDepth;
    vFocus = focusAmount;
    vBlurScale = softBlur;
    vFocusBlur = uFocusBlur;
    vInsidePortal = insidePortal;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uOpacity;
  uniform float uLutIntensity;
  uniform float uChromaticStrength;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vBreathing;
  varying float vDepth;
  varying float vFocus;
  varying float vBlurScale;
  varying float vFocusBlur;
  varying float vInsidePortal;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float blurAmount = clamp(vBlurScale, 0.0, 2.4);

    // Disc softness modulated by focusBlur
    float baseInner = mix(0.18, 0.035, clamp(blurAmount / 1.8, 0.0, 1.0));
    float focusInner = mix(0.02, 0.38, vFocusBlur);
    float inner = mix(focusInner, baseInner, 0.4);

    float alpha = smoothstep(0.5, inner, d) * vAlpha * uOpacity;
    alpha *= mix(1.0, 0.66, smoothstep(0.85, 2.1, blurAmount));
    if (alpha < 0.01) discard;

    float fringe = d * uChromaticStrength * (0.045 + blurAmount * 0.028);
    vec3 graded = mix(vColor, pow(vColor, vec3(0.74)) * vec3(1.03, 0.98, 0.92), uLutIntensity);

    // Bio color shift at high focus/portal
    float bioShift = (vInsidePortal * 0.5 + vFocusBlur * 0.5) * 0.08;
    float particleHash = fract(sin(dot(gl_PointCoord, vec2(12.9898, 78.233))) * 43758.5453);
    graded.r += bioShift * (particleHash - 0.5);
    graded.g += bioShift * (particleHash * 0.7 - 0.35);
    graded.b -= bioShift * (particleHash - 0.5) * 0.5;

    vec3 color = vec3(
      clamp(graded.r + fringe, 0.0, 1.0),
      graded.g,
      clamp(graded.b - fringe * 0.65, 0.0, 1.0)
    );
    color = mix(color, color * 1.08 + vec3(0.045), smoothstep(0.72, 1.0, vDepth) * clamp(blurAmount, 0.0, 1.0) * 0.22);
    color = mix(color * 0.92, color, clamp(vFocus, 0.0, 1.0));
    color *= 1.0 + vBreathing * 0.045;

    gl_FragColor = vec4(color, alpha);
  }
`;

type PlaygroundParams = {
  progress: number;
  focus: { intensity: number; sizeMultiplier: number };
  portal: {
    intensity: number;
    softness: number;
    brownianStrength: number;
    brownianSpeed: number;
  };
  particles: {
    pointSize: number;
    fbmAmplitude: number;
    fbmSpeed: number;
    curlStrength: number;
    breathingAmplitude: number;
  };
  post: {
    chromaticStrength: number;
    vignetteIntensity: number;
    lutIntensity: number;
  };
};

function PlaygroundParticles({
  data,
  params,
}: {
  data: ParticleData;
  params: PlaygroundParams;
}) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const { viewport, gl } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(data.colors, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(data.scales, 1));
    geo.setAttribute(
      "aRandomness",
      new THREE.BufferAttribute(data.randomness, 3),
    );
    geo.setAttribute("aDepth", new THREE.BufferAttribute(data.depths, 1));
    geo.setAttribute("aFocus", new THREE.BufferAttribute(data.focus, 1));
    geo.setAttribute(
      "aBlurScale",
      new THREE.BufferAttribute(data.blurScales, 1),
    );
    geo.computeBoundingSphere();
    return geo;
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 4 },
          uOpacity: { value: 0.95 },
          uPixelRatio: { value: 1 },
          uFbmAmplitude: { value: 1 },
          uFbmFrequency: { value: 1 },
          uFbmSpeed: { value: 1 },
          uCurlStrength: { value: 0.15 },
          uBreathingAmplitude: { value: 0.05 },
          uLutIntensity: { value: 0.5 },
          uChromaticStrength: { value: 1.5 },
          uDepthStrength: { value: 1.25 },
          uFocusDepth: { value: 0.62 },
          uForegroundBlur: { value: 1.35 },
          uNearThreshold: { value: 0.68 },
          uFocusBlur: { value: 0 },
          uPortalRadius: { value: 0 },
          uPortalSoftness: { value: 0.15 },
          uBrownianStrength: { value: 1 },
          uBrownianSpeed: { value: 1 },
          uSizeMultiplier: { value: 2.5 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      }),
    [],
  );

  useEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;

    const t = clock.getElapsedTime();
    const prog = params.progress;

    const autoFocus = clamp(prog * 2, 0, 1);
    const autoPortal = clamp((prog - 0.5) * 2, 0, 1);

    mat.uniforms.uTime.value = t;
    mat.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2);
    mat.uniforms.uFocusBlur.value = autoFocus * params.focus.intensity;
    mat.uniforms.uPortalRadius.value = autoPortal * params.portal.intensity;
    mat.uniforms.uSizeMultiplier.value = params.focus.sizeMultiplier;
    mat.uniforms.uPortalSoftness.value = params.portal.softness;
    mat.uniforms.uBrownianStrength.value = params.portal.brownianStrength;
    mat.uniforms.uBrownianSpeed.value = params.portal.brownianSpeed;
    mat.uniforms.uSize.value = params.particles.pointSize;
    mat.uniforms.uFbmAmplitude.value = params.particles.fbmAmplitude;
    mat.uniforms.uFbmSpeed.value = params.particles.fbmSpeed;
    mat.uniforms.uCurlStrength.value = params.particles.curlStrength;
    mat.uniforms.uBreathingAmplitude.value = params.particles.breathingAmplitude;
    mat.uniforms.uChromaticStrength.value = params.post.chromaticStrength;
    mat.uniforms.uLutIntensity.value = params.post.lutIntensity;

    if (pointsRef.current) {
      const coverScale = Math.max(viewport.width / 12, viewport.height / 12);
      pointsRef.current.scale.setScalar(coverScale * 1.02);
      pointsRef.current.rotation.z = Math.sin(t * 0.18) * 0.012;
    }
  });

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
      geometry={geometry}
      material={material}
    />
  );
}

export function MicrobiotaPlayground() {
  const [data, setData] = useState<ParticleData | null>(null);

  const p = useDialKit("Microbiota Zoom", {
    progress: [0, 0, 1],
    focus: {
      intensity: [1, 0, 1],
      sizeMultiplier: [2.5, 0.3, 4],
    },
    portal: {
      intensity: [1, 0, 1],
      softness: [0.15, 0.01, 0.5],
      brownianStrength: [1, 0, 3],
      brownianSpeed: [1, 0, 3],
    },
    particles: {
      pointSize: [4, 1, 10],
      fbmAmplitude: [1, 0, 2.5],
      fbmSpeed: [1, 0, 3],
      curlStrength: [0.15, 0, 0.8],
      breathingAmplitude: [0.05, 0, 0.3],
    },
    post: {
      chromaticStrength: [1.5, 0, 4],
      vignetteIntensity: [0.4, 0, 1],
      lutIntensity: [0.5, 0, 1],
    },
  }) as PlaygroundParams;

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
    <div className="relative h-full w-full">
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
        {data ? <PlaygroundParticles data={data} params={p} /> : null}
      </Canvas>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 42%, rgba(0,0,0,${p.post.vignetteIntensity}) 100%)`,
        }}
      />
      <DialRoot position="top-right" productionEnabled />
    </div>
  );
}

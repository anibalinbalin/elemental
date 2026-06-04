"use client";

import { Canvas, createPortal, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, MutableRefObject, ReactNode, SetStateAction } from "react";
import * as THREE from "three";

const TEXTURE_ROOT = "/creative-art-points";
const TEXTURE_SIZE = 256;

// --- Brand colour ramps -----------------------------------------------------
// Eight stops, dark -> light, extracted from the EB botanical key art
// (EB-1/EB-5 greens, EB-2/EB-4 violets + cornflower). The particle vertex
// shader gradient-maps each dot's luminance through the selected ramp.
// Switch live with the `?palette=balanced|green|violet` query param.
type PaletteVariant = "balanced" | "green" | "violet";

const RAW_PALETTES: Record<PaletteVariant, string[]> = {
  // violet shadows -> pale bridge -> lime highlights (both families even)
  balanced: ["#2a2f6e", "#3d51bc", "#8f71a4", "#b89ccb", "#dcd6ee", "#cfe3b0", "#8fbf4e", "#c4e58a"],
  // mostly greens; violet only in the deepest shadow
  green: ["#3a3f78", "#4f7e4a", "#5aa356", "#82b352", "#a1c15d", "#adda77", "#9fcf63", "#dff0c8"],
  // mostly lavender/violet; lime only as a highlight sparkle
  violet: ["#2a2f6e", "#3d51bc", "#6f5d9e", "#8f71a4", "#a98fbf", "#c2a6d5", "#d9d2ec", "#b9d488"],
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// "Softer / dreamy": desaturate toward luminance and lift toward a milky warm
// white, so the ramp reads like the hazy, low-contrast EB source photos rather
// than vivid confetti.
const DREAMY_DESAT = 0.62; // keep 62% of chroma (≈38% desaturated)
const DREAMY_LIFT = 0.14; // 14% toward off-white

function soften([r, g, b]: [number, number, number]): [number, number, number] {
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const d = DREAMY_DESAT;
  let rr = r * d + L * (1 - d);
  let gg = g * d + L * (1 - d);
  let bb = b * d + L * (1 - d);
  const k = DREAMY_LIFT;
  rr = rr * (1 - k) + 1.0 * k;
  gg = gg * (1 - k) + 1.0 * k;
  bb = bb * (1 - k) + 0.99 * k;
  return [rr, gg, bb];
}

function buildPalette(variant: PaletteVariant): THREE.Vector3[] {
  return RAW_PALETTES[variant].map((hex) => {
    const [r, g, b] = soften(hexToRgb(hex));
    return new THREE.Vector3(r, g, b);
  });
}

function readPaletteVariant(): PaletteVariant {
  if (typeof window === "undefined") return "balanced";
  const p = new URLSearchParams(window.location.search).get("palette");
  return p === "green" || p === "violet" || p === "balanced" ? p : "balanced";
}

// How strongly the brand ramp tints the particles. 0 = original photo colours,
// 1 = full palette replacement (loses the image). Kept low so the lifestyle
// photo stays legible and the palette reads as a wash. Override with `?mix=`.
const DEFAULT_COLOR_MIX = 0.3;

function readColorMix(): number {
  if (typeof window === "undefined") return DEFAULT_COLOR_MIX;
  const raw = new URLSearchParams(window.location.search).get("mix");
  if (raw === null) return DEFAULT_COLOR_MIX;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : DEFAULT_COLOR_MIX;
}
const PARTICLE_COUNT = TEXTURE_SIZE * TEXTURE_SIZE;
const BOUNDS_MIN = new THREE.Vector3(-60, 0, -60);
const BOUNDS_MAX = new THREE.Vector3(60, 0.5, 60);
const BOTTOM_FADE = 0.22; // fraction of screen height the particles dissolve over

type ParticleControls = {
  vignetteIntensity: number;
  chromaticAberration: number;
  pointSize: number;
  amplitude: number;
  frequency: number;
  speed: number;
  curlStrength: number;
  breatheAmplitude: number;
  depthDisplacement: number;
  depthPointScale: number;
  focusDepth: number;
  foregroundBlur: number;
  nearThreshold: number;
};

const DEFAULT_CONTROLS: ParticleControls = {
  vignetteIntensity: 0.1,
  chromaticAberration: 0.1,
  pointSize: 10,
  amplitude: 0.82,
  frequency: 1.4,
  speed: 2.4,
  curlStrength: 0.05,
  breatheAmplitude: 0.01,
  depthDisplacement: 0,
  depthPointScale: 0.3,
  focusDepth: 0.74,
  foregroundBlur: 0.10,
  nearThreshold: 0.17,
};

// Values driven by the scroll storyline (lerped from STORY_KEYFRAMES every
// frame). These live in a ref, not React state — see StoryUniforms.
type StoryValues = {
  pointSize: number;
  curlStrength: number;
  breatheAmplitude: number;
  depthDisplacement: number;
  chromaticAberration: number;
  vignetteIntensity: number;
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uFbmAmplitude;
  uniform float uFbmFrequency;
  uniform float uFbmSpeed;
  uniform float uCurlStrength;
  uniform float uBreatheAmplitude;
  uniform sampler2D uParticlesPositionHigh;
  uniform sampler2D uParticlesPositionLow;
  uniform sampler2D uParticlesColors;
  uniform sampler2D uParticlesDensity;
  uniform sampler2D uParticlesDepth;
  uniform float uColorMix;
  uniform vec3 uPalette[8];
  uniform float uDepthDisplacement;
  uniform float uDepthPointScale;
  uniform float uFocusDepth;
  uniform float uForegroundBlur;
  uniform float uNearThreshold;
  uniform vec3 uParticlesBoundsMin;
  uniform vec3 uParticlesBoundsMax;
  uniform float uParticleCount;
  uniform float uTextureSize;
  uniform float uScreenScale;

  attribute vec2 aParticleUv;
  attribute float aIndex;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  varying float vFocus;
  varying float vBlurScale;

  float valueRemap(float value, float inmin, float inmax, float outmin, float outmax) {
    return outmin + (value - inmin) * (outmax - outmin) / (inmax - inmin);
  }

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

  float fbm(vec2 st, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * noise(st);
      st = rot * st * 2.0 + shift;
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 curlNoise(vec2 st, float time) {
    float eps = 0.01;
    float n1 = fbm(st + vec2(eps, 0.0) + time * 0.1, 2);
    float n2 = fbm(st + vec2(-eps, 0.0) + time * 0.1, 2);
    float n3 = fbm(st + vec2(0.0, eps) + time * 0.1, 2);
    float n4 = fbm(st + vec2(0.0, -eps) + time * 0.1, 2);
    float dx = (n1 - n2) / (2.0 * eps);
    float dy = (n3 - n4) / (2.0 * eps);
    return vec2(dy, -dx);
  }

  vec3 remapPosition(vec3 normalizedPos) {
    vec3 range = uParticlesBoundsMax - uParticlesBoundsMin;
    vec3 worldPosition = normalizedPos * range + uParticlesBoundsMin;
    worldPosition.y = -worldPosition.y;
    return worldPosition;
  }

  // Elemental Bloom brand palette — extracted from the EB botanical key art
  // (EB-1/EB-5 lime greens, EB-2/EB-4 violets + cornflower blue). Eight stops
  // (uPalette), dark -> light, supplied from JS so the green/violet balance can
  // be swapped at runtime. Stops are routed through a near-white bridge so the
  // green and violet poles never cross-fade into mud.
  vec3 brandPalette(float t) {
    float s = clamp(t, 0.0, 1.0) * 7.0;
    vec3 col = uPalette[0];
    col = mix(col, uPalette[1], clamp(s - 0.0, 0.0, 1.0));
    col = mix(col, uPalette[2], clamp(s - 1.0, 0.0, 1.0));
    col = mix(col, uPalette[3], clamp(s - 2.0, 0.0, 1.0));
    col = mix(col, uPalette[4], clamp(s - 3.0, 0.0, 1.0));
    col = mix(col, uPalette[5], clamp(s - 4.0, 0.0, 1.0));
    col = mix(col, uPalette[6], clamp(s - 5.0, 0.0, 1.0));
    col = mix(col, uPalette[7], clamp(s - 6.0, 0.0, 1.0));
    return col;
  }

  void main() {
    vec3 sampledHigh = texture2D(uParticlesPositionHigh, aParticleUv).rgb;
    vec3 sampledLow = texture2D(uParticlesPositionLow, aParticleUv).rgb;
    vec3 highBytes = sampledHigh * 255.0;
    vec3 lowBytes = sampledLow * 255.0;
    vec3 position16bit = vec3(
      (highBytes.x * uTextureSize) + lowBytes.x,
      (highBytes.y * uTextureSize) + lowBytes.y,
      (highBytes.z * uTextureSize) + lowBytes.z
    );

    vec3 particlePosition = remapPosition(position16bit / uParticleCount);

    // Recolor each particle through the brand palette by luminance: keep the
    // baked image's light/dark structure, swap the hue. The photo's luminance
    // clusters in the mids, so stretch [0.10, 0.88] across the full ramp.
    vec3 bakedColor = texture2D(uParticlesColors, aParticleUv).rgb;
    float lum = dot(bakedColor, vec3(0.2126, 0.7152, 0.0722));
    float t = clamp((lum - 0.10) / 0.78, 0.0, 1.0);
    vColor = mix(bakedColor, brandPalette(t), uColorMix);

    float sampledDensity = texture2D(uParticlesDensity, aParticleUv).r;
    float densityScale = valueRemap(sampledDensity, 0.0, 1.0, 0.8, 1.5);

    vec2 depthUv = vec2(
      (particlePosition.x - uParticlesBoundsMin.x) / (uParticlesBoundsMax.x - uParticlesBoundsMin.x),
      1.0 - (particlePosition.z - uParticlesBoundsMin.z) / (uParticlesBoundsMax.z - uParticlesBoundsMin.z)
    );
    float depthValue = texture2D(uParticlesDepth, depthUv).r;

    vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
    vec2 particleCoord = vec2(
      aParticleUv.x + aIndex * 0.001,
      aParticleUv.y + aIndex * 0.0005
    );
    vec2 scaledCoord = particleCoord * uFbmFrequency;

    float fbmSlow = fbm(scaledCoord * 0.5 + uTime * 0.1 * uFbmSpeed, 3);
    float fbmMedium = fbm(scaledCoord * 2.0 + uTime * 0.3 * uFbmSpeed, 2);
    float fbmFast = fbm(scaledCoord * 4.0 + uTime * 1.5 * uFbmSpeed, 2);

    float organicX = ((fbmSlow - 0.5) * 0.8 + (fbmMedium - 0.5) * 0.3) * uFbmAmplitude;
    float organicY = ((fbmMedium - 0.5) * 0.6 + (fbmFast - 0.5) * 0.2) * uFbmAmplitude;
    float organicZ = ((fbmSlow - 0.5) * 0.4 + (fbmFast - 0.5) * 0.3) * uFbmAmplitude;
    float breathe = sin(uTime * 0.95 * uFbmSpeed + aIndex * 0.013);
    vec2 curl = curlNoise(scaledCoord * 1.5, uTime * 0.4 * uFbmSpeed);

    modelPosition.x += organicX * 0.5 + curl.x * uCurlStrength;
    modelPosition.y += organicY * 0.5 + curl.y * uCurlStrength;
    modelPosition.z += organicZ * 0.4 + breathe * uBreatheAmplitude * 16.0;
    modelPosition.z += depthValue * uDepthDisplacement;

    float nearAmount = smoothstep(uNearThreshold, 1.0, depthValue);
    float focusAmount = 1.0 - smoothstep(0.0, 0.55, abs(depthValue - uFocusDepth));
    float softBlur = clamp(nearAmount * uForegroundBlur + (1.0 - focusAmount) * 0.25, 0.0, 2.4);

    modelPosition.x += (fbmFast - 0.5) * nearAmount * softBlur * 0.15;
    modelPosition.y += (fbmMedium - 0.5) * nearAmount * softBlur * 0.15;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    float sizeVariation = 1.0 + (fbmFast - 0.5) * 0.3 + breathe * uBreatheAmplitude * 1.4;
    float cameraDistance = length(viewPosition.xyz);
    float perspectiveScale = (300.0 * uScreenScale) / cameraDistance;
    perspectiveScale = clamp(perspectiveScale, 0.3, 2.0);
    float depthSizeBoost = 1.0 + depthValue * uDepthPointScale;
    gl_PointSize = uSize * densityScale * sizeVariation * perspectiveScale * depthSizeBoost * (1.0 + nearAmount * 1.65 + softBlur * 0.55);

    vAlpha = (0.78 + breathe * uBreatheAmplitude * 2.4) * mix(1.0, 0.56, nearAmount * clamp(softBlur, 0.0, 1.0));
    vDepth = depthValue;
    vFocus = focusAmount;
    vBlurScale = softBlur;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  varying float vFocus;
  varying float vBlurScale;
  uniform float uChromaticStrength;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float blurAmount = clamp(vBlurScale, 0.0, 2.4);
    float inner = mix(0.18, 0.035, clamp(blurAmount / 1.8, 0.0, 1.0));
    float alpha = smoothstep(0.5, inner, d) * vAlpha;
    alpha *= mix(1.0, 0.66, smoothstep(0.85, 2.1, blurAmount));
    if (alpha < 0.01) discard;

    float fringe = d * uChromaticStrength * (0.045 + blurAmount * 0.028);
    // Color grade + LUT are pre-baked into color_baked.png — vColor is final.
    vec3 graded = vColor;

    vec3 color = vec3(
      clamp(graded.r + fringe, 0.0, 1.0),
      graded.g,
      clamp(graded.b - fringe * 0.65, 0.0, 1.0)
    );
    color = mix(color, color * 1.08 + vec3(0.045), smoothstep(0.72, 1.0, vDepth) * clamp(blurAmount, 0.0, 1.0) * 0.22);
    color = mix(color * 0.92, color, clamp(vFocus, 0.0, 1.0));

    gl_FragColor = vec4(color, alpha);
  }
`;

const postVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const postFragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uVignetteIntensity;
  uniform float uChromaticAberration;
  uniform float uWhiteProgress;
  uniform vec3 uBackground;
  uniform float uBottomFade;

  void main() {
    vec2 uv = vUv;
    vec2 direction = normalize(uv - 0.5) * uChromaticAberration / uResolution;

    float r = texture2D(uTexture, uv + direction).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - direction).b;
    vec3 color = vec3(r, g, b);

    // Dissolve particles into the background toward the bottom edge so the
    // canvas blends seamlessly into the white buffer section below. Gated by
    // uWhiteProgress so it only engages during the end-of-scroll white fade.
    // vUv.y is 0 at the bottom of the full-screen quad, 1 at the top.
    float baseReveal = smoothstep(0.0, uBottomFade, uv.y);
    float bottomReveal = mix(1.0, baseReveal, uWhiteProgress);
    color = mix(uBackground, color, bottomReveal);

    float dist = distance(uv, vec2(0.5));
    float vignette = 1.0 - smoothstep(0.4, 0.9, dist * uVignetteIntensity);
    // Blend the vignette toward the (now light) background instead of
    // multiplying toward black, so edges fade to cream rather than a black oval.
    color = mix(uBackground, color, mix(vignette, 1.0, uWhiteProgress));

    color = pow(color, vec3(0.95));
    color.r *= 1.02;
    color.b *= 0.98;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function configureTexture(texture: THREE.Texture) {
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
}

function createParticleGeometry() {
  const uvs = new Float32Array(PARTICLE_COUNT * 2);
  const indices = new Float32Array(PARTICLE_COUNT);
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let index = 0; index < PARTICLE_COUNT; index++) {
    const x = index % TEXTURE_SIZE;
    const y = Math.floor(index / TEXTURE_SIZE);
    uvs[index * 2] = (x + 0.5) / TEXTURE_SIZE;
    uvs[index * 2 + 1] = (y + 0.5) / TEXTURE_SIZE;
    indices[index] = index;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aParticleUv", new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute("aIndex", new THREE.BufferAttribute(indices, 1));
  return geometry;
}

function Particles({
  controls,
  storyRef,
  palette,
  colorMix,
}: {
  controls: ParticleControls;
  storyRef: MutableRefObject<StoryValues>;
  palette: THREE.Vector3[];
  colorMix: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size, viewport } = useThree();
  const [positionHigh, positionLow, colorTexture, densityTexture, depthTexture] = useLoader(
    THREE.TextureLoader,
    [
      `${TEXTURE_ROOT}/position_h.png`,
      `${TEXTURE_ROOT}/position_l.png`,
      `${TEXTURE_ROOT}/color_baked.png`,
      `${TEXTURE_ROOT}/density.png`,
      `${TEXTURE_ROOT}/depth.png`,
    ],
  );

  useEffect(() => {
    configureTexture(positionHigh);
    configureTexture(positionLow);
    configureTexture(densityTexture);
    configureTexture(colorTexture);
    depthTexture.flipY = false;
    depthTexture.generateMipmaps = true;
    depthTexture.minFilter = THREE.LinearMipmapLinearFilter;
    depthTexture.magFilter = THREE.LinearFilter;
    depthTexture.needsUpdate = true;
  }, [colorTexture, densityTexture, depthTexture, positionHigh, positionLow]);

  const screenScale = useMemo(
    () => 1920 / Math.max(1, size.height) / Math.max(1, viewport.dpr),
    [size.height, viewport.dpr],
  );

  const geometry = useMemo(createParticleGeometry, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: controls.pointSize },
      uFbmAmplitude: { value: controls.amplitude },
      uFbmFrequency: { value: controls.frequency },
      uFbmSpeed: { value: controls.speed },
      uCurlStrength: { value: controls.curlStrength },
      uBreatheAmplitude: { value: controls.breatheAmplitude },
      uParticlesPositionHigh: { value: positionHigh },
      uParticlesPositionLow: { value: positionLow },
      uParticlesColors: { value: colorTexture },
      uColorMix: { value: colorMix },
      uPalette: { value: palette },
      uParticlesDensity: { value: densityTexture },
      uParticlesDepth: { value: depthTexture },
      uDepthDisplacement: { value: controls.depthDisplacement },
      uDepthPointScale: { value: controls.depthPointScale },
      uFocusDepth: { value: controls.focusDepth },
      uForegroundBlur: { value: controls.foregroundBlur },
      uNearThreshold: { value: controls.nearThreshold },
      uChromaticStrength: { value: controls.chromaticAberration },
      uParticlesBoundsMin: { value: BOUNDS_MIN },
      uParticlesBoundsMax: { value: BOUNDS_MAX },
      uParticleCount: { value: PARTICLE_COUNT },
      uTextureSize: { value: TEXTURE_SIZE },
      uScreenScale: { value: screenScale },
    }),
    [colorMix, colorTexture, controls, densityTexture, depthTexture, palette, positionHigh, positionLow, screenScale],
  );

  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );

  useFrame((_, delta) => {
    const uniforms = materialRef.current?.uniforms;
    if (!uniforms) return;
    const story = storyRef.current;
    // Clamp delta so a long pause (frameloop "demand") doesn't advance the
    // noise field in one giant step on the first resumed frame when you scroll
    // back into the section — that was the visible jolt on re-entry.
    uniforms.uTime.value += Math.min(delta, 1 / 30);
    uniforms.uScreenScale.value = screenScale;
    uniforms.uSize.value = story.pointSize;
    uniforms.uFbmAmplitude.value = controls.amplitude;
    uniforms.uFbmFrequency.value = controls.frequency;
    uniforms.uFbmSpeed.value = controls.speed;
    uniforms.uCurlStrength.value = story.curlStrength;
    uniforms.uBreatheAmplitude.value = story.breatheAmplitude;
    uniforms.uDepthDisplacement.value = story.depthDisplacement;
    uniforms.uDepthPointScale.value = controls.depthPointScale;
    uniforms.uFocusDepth.value = controls.focusDepth;
    uniforms.uForegroundBlur.value = controls.foregroundBlur;
    uniforms.uNearThreshold.value = controls.nearThreshold;
    uniforms.uChromaticStrength.value = story.chromaticAberration;
  });

  return (
    <points frustumCulled={false} geometry={geometry} rotation={[Math.PI / 2, 0, 0]} scale={0.9}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </points>
  );
}

function PostProcessedScene({
  children,
  progressRef,
  storyRef,
}: {
  children: ReactNode;
  progressRef: MutableRefObject<number>;
  storyRef: MutableRefObject<StoryValues>;
}) {
  const { camera, gl, size, viewport } = useThree();
  const renderScene = useMemo(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fffff9");
    return scene;
  }, []);
  const quadScene = useMemo(() => new THREE.Scene(), []);
  const quadCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const renderTarget = useMemo(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        format: THREE.RGBAFormat,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
        type: THREE.HalfFloatType,
      }),
    [],
  );
  const postMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        fragmentShader: postFragmentShader,
        toneMapped: false,
        uniforms: {
          uTexture: { value: renderTarget.texture },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uVignetteIntensity: { value: DEFAULT_CONTROLS.vignetteIntensity },
          uChromaticAberration: { value: DEFAULT_CONTROLS.chromaticAberration },
          uWhiteProgress: { value: 0 },
          uBackground: { value: new THREE.Color("#fffff9") },
          uBottomFade: { value: BOTTOM_FADE },
        },
        vertexShader: postVertexShader,
      }),
    [renderTarget.texture],
  );

  useEffect(() => {
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
    quadScene.add(quad);

    return () => {
      quadScene.remove(quad);
      quad.geometry.dispose();
    };
  }, [postMaterial, quadScene]);

  useEffect(() => {
    const width = Math.max(1, Math.floor(size.width * viewport.dpr));
    const height = Math.max(1, Math.floor(size.height * viewport.dpr));
    renderTarget.setSize(width, height);
    postMaterial.uniforms.uResolution.value.set(width, height);
  }, [postMaterial, renderTarget, size.height, size.width, viewport.dpr]);

  useEffect(
    () => () => {
      renderScene.clear();
      quadScene.clear();
      renderTarget.dispose();
      postMaterial.dispose();
    },
    [postMaterial, quadScene, renderScene, renderTarget],
  );

  useFrame((_, delta) => {
    postMaterial.uniforms.uTime.value += Math.min(delta, 1 / 30);
    postMaterial.uniforms.uTexture.value = renderTarget.texture;
    postMaterial.uniforms.uVignetteIntensity.value = storyRef.current.vignetteIntensity;
    postMaterial.uniforms.uChromaticAberration.value = storyRef.current.chromaticAberration;

    const bgT = Math.max(0, Math.min(1, (progressRef.current - 0.88) / 0.12));
    const bgEased = bgT * bgT * (3 - 2 * bgT);
    // #fffff9 background to match the site surface, easing to pure white only at
    // the very end of the storyline (unused by the band, which caps at ~0.85).
    const r = 1.0;
    const g = 1.0;
    const b = 0.9765 + bgEased * (1 - 0.9765);
    (renderScene.background as THREE.Color).setRGB(r, g, b);
    (postMaterial.uniforms.uBackground.value as THREE.Color).setRGB(r, g, b);

    postMaterial.uniforms.uWhiteProgress.value = bgEased;

    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(renderScene, camera);
    gl.setRenderTarget(null);
    gl.render(quadScene, quadCamera);
  }, 1);

  return createPortal(children, renderScene);
}

function ControlSlider({
  label,
  max,
  min,
  step,
  value,
  onChange,
}: {
  label: string;
  max: number;
  min: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid grid-cols-[82px_1fr_38px] items-center gap-2 px-3 py-1.5 text-[11px] text-slate-400">
      <span>{label}</span>
      <input
        className="h-1 accent-[#1684ff]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        step={step}
        type="range"
        value={value}
      />
      <span className="rounded bg-slate-700/80 px-1.5 py-0.5 text-right text-[10px] tabular-nums text-slate-300">
        {value.toFixed(step < 0.1 ? 2 : 1)}
      </span>
    </label>
  );
}

function ControlSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <details className="border-t border-slate-700/70 py-1" open>
      <summary className="cursor-pointer select-none px-3 py-1 text-[11px] font-semibold text-slate-200">
        {title}
      </summary>
      {children}
    </details>
  );
}

function ControlsPanel({
  controls,
  setControls,
}: {
  controls: ParticleControls;
  setControls: Dispatch<SetStateAction<ParticleControls>>;
}) {
  const [open, setOpen] = useState(true);
  const update = (key: keyof ParticleControls) => (value: number) => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    setOpen(window.innerWidth >= 720);
  }, []);

  return (
    <aside className="absolute right-3 top-3 z-10 max-h-[calc(100vh-24px)] w-[280px] overflow-hidden rounded-md border border-slate-700/70 bg-[#1b2028]/95 font-mono shadow-2xl backdrop-blur max-[720px]:bottom-3 max-[720px]:top-auto max-[720px]:w-[calc(100vw-24px)]">
      <button
        className="flex h-9 w-full items-center justify-between bg-[#2a2f3b] px-3 text-left text-slate-400"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="text-[11px]">Controls</span>
        <span className="text-xs tracking-[0.35em]">{open ? "•••" : "••"}</span>
      </button>
      {open ? (
        <div className="max-h-[calc(100vh-60px)] overflow-y-auto">
          <ControlSection title="Post Processing">
            <ControlSlider
              label="Vignette"
              max={3}
              min={0}
              onChange={update("vignetteIntensity")}
              step={0.1}
              value={controls.vignetteIntensity}
            />
            <ControlSlider
              label="Chromatic"
              max={10}
              min={0}
              onChange={update("chromaticAberration")}
              step={0.1}
              value={controls.chromaticAberration}
            />
          </ControlSection>
          <ControlSection title="Particles">
            <ControlSlider
              label="Point Size"
              max={10}
              min={1}
              onChange={update("pointSize")}
              step={1}
              value={controls.pointSize}
            />
          </ControlSection>
          <ControlSection title="FBM">
            <ControlSlider
              label="Amplitude"
              max={3}
              min={0}
              onChange={update("amplitude")}
              step={0.01}
              value={controls.amplitude}
            />
            <ControlSlider
              label="Frequency"
              max={5}
              min={0.1}
              onChange={update("frequency")}
              step={0.1}
              value={controls.frequency}
            />
            <ControlSlider
              label="Speed"
              max={3}
              min={0}
              onChange={update("speed")}
              step={0.1}
              value={controls.speed}
            />
          </ControlSection>
          <ControlSection title="Curl">
            <ControlSlider
              label="Strength"
              max={1}
              min={0}
              onChange={update("curlStrength")}
              step={0.01}
              value={controls.curlStrength}
            />
          </ControlSection>
          <ControlSection title="Breathing">
            <ControlSlider
              label="Amplitude"
              max={0.2}
              min={0}
              onChange={update("breatheAmplitude")}
              step={0.01}
              value={controls.breatheAmplitude}
            />
          </ControlSection>
          <ControlSection title="Depth">
            <ControlSlider
              label="Displacement"
              max={20}
              min={0}
              onChange={update("depthDisplacement")}
              step={0.5}
              value={controls.depthDisplacement}
            />
            <ControlSlider
              label="Size Scale"
              max={1}
              min={0}
              onChange={update("depthPointScale")}
              step={0.05}
              value={controls.depthPointScale}
            />
            <ControlSlider
              label="Focus"
              max={1}
              min={0}
              onChange={update("focusDepth")}
              step={0.01}
              value={controls.focusDepth}
            />
            <ControlSlider
              label="Near Blur"
              max={3}
              min={0}
              onChange={update("foregroundBlur")}
              step={0.05}
              value={controls.foregroundBlur}
            />
            <ControlSlider
              label="Near Gate"
              max={1}
              min={0}
              onChange={update("nearThreshold")}
              step={0.01}
              value={controls.nearThreshold}
            />
          </ControlSection>
        </div>
      ) : null}
    </aside>
  );
}

const STORY_KEYFRAMES = [
  { z: 115, x: 0, y: 0, targetY: 0, depthDisplacement: 0, curlStrength: 0.05, breatheAmplitude: 0.01, pointSize: 10, vignetteIntensity: 0.3, chromaticAberration: 0.0 },
  { z: 60, x: 4, y: 3, targetY: 2, depthDisplacement: 8, curlStrength: 0.10, breatheAmplitude: 0.02, pointSize: 12, vignetteIntensity: 0.8, chromaticAberration: 1.5 },
  { z: 25, x: -3, y: -4, targetY: -2, depthDisplacement: 16, curlStrength: 0.25, breatheAmplitude: 0.05, pointSize: 16, vignetteIntensity: 1.4, chromaticAberration: 3.5 },
  { z: 8, x: 2, y: 1, targetY: 0, depthDisplacement: 20, curlStrength: 0.50, breatheAmplitude: 0.12, pointSize: 22, vignetteIntensity: 2.2, chromaticAberration: 6.0 },
];

function lerpKeyframes(progress: number) {
  const count = STORY_KEYFRAMES.length - 1;
  const scaled = progress * count;
  const i = Math.min(Math.floor(scaled), count - 1);
  const t = scaled - i;
  const a = STORY_KEYFRAMES[i];
  const b = STORY_KEYFRAMES[i + 1];
  const result: Record<string, number> = {};
  for (const key of Object.keys(a) as (keyof typeof a)[]) {
    result[key] = a[key] + (b[key] - a[key]) * t;
  }
  return result;
}

const IMAGE_HALF_WIDTH = 54;
const V_FOV_RAD = (50 / 2) * (Math.PI / 180);
const REFERENCE_Z = 115;

function fitWidthDistance(aspect: number) {
  const hFovRad = Math.atan(Math.tan(V_FOV_RAD) * aspect);
  return IMAGE_HALF_WIDTH / Math.tan(hFovRad);
}

function StoryCamera({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 115));
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const d = fitWidthDistance(aspect);
    targetPos.current.set(0, 0, d);
    camera.position.copy(targetPos.current);
    camera.lookAt(lookTarget.current);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  useFrame(() => {
    const kf = lerpKeyframes(progressRef.current);
    const aspect = size.width / Math.max(1, size.height);
    const zScale = fitWidthDistance(aspect) / REFERENCE_Z;
    targetPos.current.set(kf.x * zScale, kf.y * zScale, kf.z * zScale);
    lookTarget.current.set(0, kf.targetY * zScale, 0);
    camera.position.lerp(targetPos.current, 0.08);
    camera.lookAt(lookTarget.current);
  });

  return null;
}

function StoryUniforms({
  progressRef,
  storyRef,
}: {
  progressRef: MutableRefObject<number>;
  storyRef: MutableRefObject<StoryValues>;
}) {
  const prevProgress = useRef(-1);

  useFrame(() => {
    const p = progressRef.current;
    if (Math.abs(p - prevProgress.current) < 0.001) return;
    prevProgress.current = p;
    const kf = lerpKeyframes(p);
    // Write straight to the shared ref read by the particle + post useFrame
    // loops. This used to call setControls() every scroll frame, re-rendering
    // the whole Canvas subtree (and rebuilding the uniforms object) each tick —
    // the main-thread cost behind the choppiness, worst when re-entering the
    // heavy close-up on scroll-up.
    const story = storyRef.current;
    story.depthDisplacement = kf.depthDisplacement;
    story.curlStrength = kf.curlStrength;
    story.breatheAmplitude = kf.breatheAmplitude;
    story.pointSize = kf.pointSize;
    story.vignetteIntensity = kf.vignetteIntensity;
    story.chromaticAberration = kf.chromaticAberration;
  });

  return null;
}

function FrameInvalidator({ paused }: { paused: boolean }) {
  const { invalidate } = useThree();
  useFrame(() => {
    if (!paused) invalidate();
  });
  return null;
}

export function LivingParticleSystem({
  progressRef,
  stageCount,
  paused = false,
}: {
  progressRef: MutableRefObject<number>;
  stageCount: number;
  paused?: boolean;
}) {
  const [controls] = useState<ParticleControls>(DEFAULT_CONTROLS);
  // Brand colour ramp. Defaults to "balanced"; `?palette=green|violet` swaps it
  // live so the green/violet balance can be A/B'd on the deployed page.
  const [paletteVariant, setPaletteVariant] = useState<PaletteVariant>("balanced");
  const [colorMix, setColorMix] = useState(DEFAULT_COLOR_MIX);
  useEffect(() => {
    setPaletteVariant(readPaletteVariant());
    setColorMix(readColorMix());
  }, []);
  const palette = useMemo(() => buildPalette(paletteVariant), [paletteVariant]);
  // Story-driven values change every scroll frame; keep them in a ref so
  // updating them never re-renders the Canvas subtree. Seeded from keyframe 0.
  const storyRef = useRef<StoryValues>({
    pointSize: 10,
    curlStrength: 0.05,
    breatheAmplitude: 0.01,
    depthDisplacement: 0,
    chromaticAberration: 0,
    vignetteIntensity: 0.3,
  });

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 115], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        frameloop="demand"
      >
        <FrameInvalidator paused={paused} />
        <color args={["#fffff9"]} attach="background" />
        <StoryCamera progressRef={progressRef} />
        <StoryUniforms progressRef={progressRef} storyRef={storyRef} />
        <PostProcessedScene progressRef={progressRef} storyRef={storyRef}>
          <Suspense fallback={null}>
            <Particles controls={controls} storyRef={storyRef} palette={palette} colorMix={colorMix} />
          </Suspense>
        </PostProcessedScene>
      </Canvas>
    </div>
  );
}

"use client";

import { Canvas, createPortal, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, ReactNode } from "react";
import * as THREE from "three";

const TEXTURE_ROOT = "/creative-art-points";
const TEXTURE_SIZE = 256;
const DATA_PARTICLE_COUNT = TEXTURE_SIZE * TEXTURE_SIZE;
const PARTICLE_GRID_SIZE = 192;
const RENDERED_PARTICLE_COUNT = PARTICLE_GRID_SIZE * PARTICLE_GRID_SIZE;
const CANVAS_DPR: [number, number] = [1, 1.35];
const POSTPROCESS_SCALE = 0.82;
const BOUNDS_MIN = new THREE.Vector3(-60, 0, -60);
const BOUNDS_MAX = new THREE.Vector3(60, 0.5, 60);

type ParticleControls = {
  vignetteIntensity: number;
  chromaticAberration: number;
  pointSize: number;
  amplitude: number;
  frequency: number;
  speed: number;
  curlStrength: number;
  breatheAmplitude: number;
  lutIntensity: number;
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
  lutIntensity: 0.49,
  depthDisplacement: 0,
  depthPointScale: 0.3,
  focusDepth: 0.74,
  foregroundBlur: 0.10,
  nearThreshold: 0.17,
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
    vColor = texture2D(uParticlesColors, aParticleUv).rgb;

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
    float fbmFast = fbm(scaledCoord * 4.0 + uTime * 1.5 * uFbmSpeed, 1);

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
    perspectiveScale = clamp(perspectiveScale, 0.3, 2.5);
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
  uniform sampler2D uLookup;
  uniform float uLutIntensity;
  uniform float uChromaticStrength;

  vec4 lookup(in vec4 textureColor, in sampler2D lookupTable) {
    textureColor = clamp(textureColor, 0.0, 1.0);
    mediump float blueColor = textureColor.b * 63.0;
    mediump vec2 quad1;
    quad1.y = floor(floor(blueColor) / 8.0);
    quad1.x = floor(blueColor) - (quad1.y * 8.0);
    mediump vec2 quad2;
    quad2.y = floor(ceil(blueColor) / 8.0);
    quad2.x = ceil(blueColor) - (quad2.y * 8.0);
    highp vec2 texPos1;
    texPos1.x = (quad1.x * 0.125) + 0.5 / 512.0 + ((0.125 - 1.0 / 512.0) * textureColor.r);
    texPos1.y = (quad1.y * 0.125) + 0.5 / 512.0 + ((0.125 - 1.0 / 512.0) * textureColor.g);
    highp vec2 texPos2;
    texPos2.x = (quad2.x * 0.125) + 0.5 / 512.0 + ((0.125 - 1.0 / 512.0) * textureColor.r);
    texPos2.y = (quad2.y * 0.125) + 0.5 / 512.0 + ((0.125 - 1.0 / 512.0) * textureColor.g);
    lowp vec4 newColor1 = texture2D(lookupTable, texPos1);
    lowp vec4 newColor2 = texture2D(lookupTable, texPos2);
    lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
    return vec4(newColor.rgb, textureColor.a);
  }

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float blurAmount = clamp(vBlurScale, 0.0, 2.4);
    float inner = mix(0.18, 0.035, clamp(blurAmount / 1.8, 0.0, 1.0));
    float alpha = smoothstep(0.5, inner, d) * vAlpha;
    alpha *= mix(1.0, 0.66, smoothstep(0.85, 2.1, blurAmount));
    if (alpha < 0.01) discard;

    float fringe = d * uChromaticStrength * (0.045 + blurAmount * 0.028);
    vec3 graded = mix(vColor, pow(vColor, vec3(0.74)) * vec3(1.03, 0.98, 0.92), uLutIntensity);
    vec4 lutColor = lookup(vec4(graded, 1.0), uLookup);
    graded = mix(graded, lutColor.rgb, uLutIntensity);

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

  void main() {
    vec2 uv = vUv;
    vec2 direction = normalize(uv - 0.5) * uChromaticAberration / uResolution;

    float r = texture2D(uTexture, uv + direction).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - direction).b;
    vec3 color = vec3(r, g, b);

    float dist = distance(uv, vec2(0.5));
    float vignette = 1.0 - smoothstep(0.4, 0.9, dist * uVignetteIntensity);
    color *= mix(vignette, 1.0, uWhiteProgress);

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
  const uvs = new Float32Array(RENDERED_PARTICLE_COUNT * 2);
  const indices = new Float32Array(RENDERED_PARTICLE_COUNT);
  const positions = new Float32Array(RENDERED_PARTICLE_COUNT * 3);

  for (let index = 0; index < RENDERED_PARTICLE_COUNT; index++) {
    const x = index % PARTICLE_GRID_SIZE;
    const y = Math.floor(index / PARTICLE_GRID_SIZE);
    const sourceX = (x / (PARTICLE_GRID_SIZE - 1)) * (TEXTURE_SIZE - 1);
    const sourceY = (y / (PARTICLE_GRID_SIZE - 1)) * (TEXTURE_SIZE - 1);
    uvs[index * 2] = (sourceX + 0.5) / TEXTURE_SIZE;
    uvs[index * 2 + 1] = (sourceY + 0.5) / TEXTURE_SIZE;
    indices[index] = index;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aParticleUv", new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute("aIndex", new THREE.BufferAttribute(indices, 1));
  return geometry;
}

function Particles({ controlsRef }: { controlsRef: MutableRefObject<ParticleControls> }) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size, viewport } = useThree();
  const controls = controlsRef.current;
  const [positionHigh, positionLow, colorTexture, densityTexture, lutTexture, depthTexture] = useLoader(
    THREE.TextureLoader,
    [
      `${TEXTURE_ROOT}/position_h.png`,
      `${TEXTURE_ROOT}/position_l.png`,
      `${TEXTURE_ROOT}/color.png`,
      `${TEXTURE_ROOT}/density.png`,
      `${TEXTURE_ROOT}/LUT.png`,
      `${TEXTURE_ROOT}/depth.png`,
    ],
  );

  useEffect(() => {
    configureTexture(positionHigh);
    configureTexture(positionLow);
    configureTexture(densityTexture);
    configureTexture(colorTexture);
    configureTexture(lutTexture);
    depthTexture.flipY = false;
    depthTexture.generateMipmaps = true;
    depthTexture.minFilter = THREE.LinearMipmapLinearFilter;
    depthTexture.magFilter = THREE.LinearFilter;
    depthTexture.needsUpdate = true;
  }, [colorTexture, densityTexture, depthTexture, lutTexture, positionHigh, positionLow]);

  const screenScale = useMemo(
    () => 1920 / Math.max(1, size.height) / Math.max(1, viewport.dpr || 1),
    [size.height, viewport.dpr],
  );

  const geometry = useMemo(createParticleGeometry, []);

  const uniforms = useMemo(
    () => ({
      uLookup: { value: lutTexture },
      uLutIntensity: { value: controls.lutIntensity },
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
      uParticleCount: { value: DATA_PARTICLE_COUNT },
      uTextureSize: { value: TEXTURE_SIZE },
      uScreenScale: { value: screenScale },
    }),
    [colorTexture, controls, densityTexture, depthTexture, lutTexture, positionHigh, positionLow, screenScale],
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
    const controls = controlsRef.current;
    uniforms.uTime.value += delta;
    uniforms.uScreenScale.value = screenScale;
    uniforms.uLutIntensity.value = controls.lutIntensity;
    uniforms.uSize.value = controls.pointSize;
    uniforms.uFbmAmplitude.value = controls.amplitude;
    uniforms.uFbmFrequency.value = controls.frequency;
    uniforms.uFbmSpeed.value = controls.speed;
    uniforms.uCurlStrength.value = controls.curlStrength;
    uniforms.uBreatheAmplitude.value = controls.breatheAmplitude;
    uniforms.uDepthDisplacement.value = controls.depthDisplacement;
    uniforms.uDepthPointScale.value = controls.depthPointScale;
    uniforms.uFocusDepth.value = controls.focusDepth;
    uniforms.uForegroundBlur.value = controls.foregroundBlur;
    uniforms.uNearThreshold.value = controls.nearThreshold;
    uniforms.uChromaticStrength.value = controls.chromaticAberration;
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
  controlsRef,
  progressRef,
}: {
  children: ReactNode;
  controlsRef: MutableRefObject<ParticleControls>;
  progressRef: MutableRefObject<number>;
}) {
  const { camera, gl, size, viewport } = useThree();
  const renderScene = useMemo(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050505");
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
    const dpr = Math.min(viewport.dpr || 1, CANVAS_DPR[1]);
    const width = Math.max(1, Math.floor(size.width * dpr * POSTPROCESS_SCALE));
    const height = Math.max(1, Math.floor(size.height * dpr * POSTPROCESS_SCALE));
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
    postMaterial.uniforms.uTime.value += delta;
    postMaterial.uniforms.uTexture.value = renderTarget.texture;
    const controls = controlsRef.current;
    postMaterial.uniforms.uVignetteIntensity.value = controls.vignetteIntensity;
    postMaterial.uniforms.uChromaticAberration.value = controls.chromaticAberration;

    const bgT = Math.max(0, Math.min(1, (progressRef.current - 0.88) / 0.12));
    const bgEased = bgT * bgT * (3 - 2 * bgT);
    const base = 0.0196;
    const r = base + bgEased * (1 - base);
    const g = r;
    const b = base + bgEased * (0.9882 - base);
    (renderScene.background as THREE.Color).setRGB(r, g, b);

    postMaterial.uniforms.uWhiteProgress.value = bgEased;

    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(renderScene, camera);
    gl.setRenderTarget(null);
    gl.render(quadScene, quadCamera);
  }, 1);

  return createPortal(children, renderScene);
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
  controlsRef,
}: {
  progressRef: MutableRefObject<number>;
  controlsRef: MutableRefObject<ParticleControls>;
}) {
  const prevProgress = useRef(0);

  useFrame(() => {
    const p = progressRef.current;
    if (Math.abs(p - prevProgress.current) < 0.001) return;
    prevProgress.current = p;
    const kf = lerpKeyframes(p);
    const controls = controlsRef.current;
    controls.depthDisplacement = kf.depthDisplacement;
    controls.curlStrength = kf.curlStrength;
    controls.breatheAmplitude = kf.breatheAmplitude;
    controls.pointSize = kf.pointSize;
    controls.vignetteIntensity = kf.vignetteIntensity;
    controls.chromaticAberration = kf.chromaticAberration;
  });

  return null;
}

export function LivingParticleSystem({
  progressRef,
  stageCount,
}: {
  progressRef: MutableRefObject<number>;
  stageCount: number;
}) {
  const controlsRef = useRef<ParticleControls>({ ...DEFAULT_CONTROLS });

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 115], fov: 50 }}
        dpr={CANVAS_DPR}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      >
        <color args={["#050505"]} attach="background" />
        <StoryCamera progressRef={progressRef} />
        <StoryUniforms progressRef={progressRef} controlsRef={controlsRef} />
        <PostProcessedScene controlsRef={controlsRef} progressRef={progressRef}>
          <Suspense fallback={null}>
            <Particles controlsRef={controlsRef} />
          </Suspense>
        </PostProcessedScene>
      </Canvas>
    </div>
  );
}

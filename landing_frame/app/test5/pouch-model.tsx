"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

useGLTF.preload("/microcore-pouch-test6.glb");

const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

const ROUGHNESS_PATCH = /* glsl */ `#include <roughnessmap_fragment>

  float roughNoise1 = snoise(vWorldPosition * 6.0) * 0.025;
  float roughNoise2 = snoise(vWorldPosition * 50.0) * 0.015;

  float scratch1 = snoise(vec3(vWorldPosition.x * 120.0, vWorldPosition.y * 8.0, vWorldPosition.z * 40.0));
  float scratchMask1 = smoothstep(0.6, 0.8, scratch1) * 0.06;
  float scratch2 = snoise(vec3(vWorldPosition.x * 60.0 + vWorldPosition.y * 30.0, vWorldPosition.y * 10.0, vWorldPosition.z * 20.0));
  float scratchMask2 = smoothstep(0.65, 0.85, scratch2) * 0.04;

  roughnessFactor += roughNoise1 + roughNoise2 + scratchMask1 + scratchMask2;
  roughnessFactor = clamp(roughnessFactor, 0.08, 0.35);`;

const NORMAL_PATCH = /* glsl */ `#include <normal_fragment_maps>

  float bump1 = snoise(vWorldPosition * 15.0);
  float bump2 = snoise(vWorldPosition * 40.0);

  vec3 wrinkle = vec3(
    snoise(vWorldPosition * 12.0 + vec3(1.0, 0.0, 0.0)) - bump1,
    snoise(vWorldPosition * 12.0 + vec3(0.0, 1.0, 0.0)) - bump1,
    0.0
  ) * 0.02;

  vec3 microBump = vec3(
    snoise(vWorldPosition * 70.0 + vec3(1.0, 0.0, 0.0)) - bump2,
    snoise(vWorldPosition * 70.0 + vec3(0.0, 1.0, 0.0)) - bump2,
    0.0
  ) * 0.008;

  float crease1 = sin(vWorldPosition.y * 18.0 + snoise(vWorldPosition * 3.0) * 2.0);
  float creaseMask1 = smoothstep(0.92, 1.0, crease1) * 0.012;
  float crease2 = sin(vWorldPosition.x * 14.0 + vWorldPosition.y * 6.0 + snoise(vWorldPosition * 2.5) * 1.5);
  float creaseMask2 = smoothstep(0.94, 1.0, crease2) * 0.008;

  vec3 creaseNormal = vec3(
    creaseMask1 * cos(vWorldPosition.y * 18.0),
    creaseMask2 * cos(vWorldPosition.x * 14.0 + vWorldPosition.y * 6.0),
    0.0
  );

  normal = normalize(normal + wrinkle + microBump + creaseNormal);`;

const CACHE_KEY = "pouch-noise-v1";

function patchMaterial(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `#include <common>
     varying vec3 vWorldPosition;`
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <worldpos_vertex>",
    `#include <worldpos_vertex>
     vWorldPosition = worldPosition.xyz;`
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `#include <common>
     varying vec3 vWorldPosition;
     ${noiseGLSL}`
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <roughnessmap_fragment>",
    ROUGHNESS_PATCH
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <normal_fragment_maps>",
    NORMAL_PATCH
  );
}

export function PouchModel() {
  const { scene } = useGLTF("/microcore-pouch-test6.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      for (const mat of materials) {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.metalness = 0.7;
          mat.roughness = 0.56;
          mat.envMapIntensity = 1.8;
          mat.side = THREE.DoubleSide;
          mat.onBeforeCompile = patchMaterial;
          mat.customProgramCacheKey = () => CACHE_KEY;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

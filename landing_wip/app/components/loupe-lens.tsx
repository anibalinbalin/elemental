"use client";

import { ScreenQuad, shaderMaterial } from "@react-three/drei";
import {
  Canvas,
  extend,
  useFrame,
  type ThreeElement,
} from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * WebGL glass lens for the microscope loupe — the A/B alternative to the flat
 * CSS background-scale magnifier in `image-loupe.tsx`. Ported from the
 * marijanapav "stamps" loupe: the lens is a physically ray-traced glass
 * ellipsoid (front + back refraction, IOR, per-channel chromatic aberration,
 * oblateness/bevel/thickness, Fresnel rim + specular). It samples the source
 * image around the lens center, so corners genuinely bend the underlying art
 * instead of just scaling it.
 *
 * Driven imperatively: the parent's pointer/dial loop writes `{x,y,zoom,w,h}`
 * (container CSS px) into `stateRef` every frame and the shader reads it in
 * `useFrame` — no React re-renders, no store. The shaders are inlined as
 * strings because this build has no `.frag`/`.vert` import loader.
 */

const vertexShader = /* glsl */ `
varying vec2 vQuadUV;
void main(){
  vQuadUV = position.xy * .5 + .5;
  gl_Position = vec4(position.xy, 0., 1.);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

varying vec2 vQuadUV;

uniform sampler2D uSourceTex;
uniform vec2 uSourceSizePx;
uniform vec2 uLensCenterPx;
uniform float uLensMagnification;
uniform float uLensIOR;
uniform float uAberrationAmount;
uniform float uLensThickness;
uniform float uBevelStartR;
uniform float uLensRadiusPx;
uniform float uLensOblateness;
uniform float uRefractionDisplacementScale;

const float IOR_AIR=1.;
const float EPS=1e-6;

vec2 calcPixelOffsetUV(vec2 unitDiskCoords,vec2 invSourceSizePx){
    vec2 pixelOffset=unitDiskCoords*uLensRadiusPx;
    return pixelOffset*invSourceSizePx;
}

vec2 calcMagnificationUVOffset(vec2 unitDiskCoords,vec2 invSourceSizePx){
    return calcPixelOffsetUV(unitDiskCoords,invSourceSizePx)/max(EPS,uLensMagnification);
}

void calcFrontSurfacePointAndNormal(vec2 unitDiskCoords,float zScale,out vec3 frontPoint,out vec3 frontNormal){
    float radiusSq=dot(unitDiskCoords,unitDiskCoords);
    float zAxisDepth=zScale*sqrt(max(0.,1.-radiusSq));
    frontPoint=vec3(unitDiskCoords,zAxisDepth);
    frontNormal=normalize(vec3(unitDiskCoords,zAxisDepth/(zScale*zScale)));
}

bool intersectBackEllipsoid(vec3 rayOrigin,vec3 rayDir,float thickness,float zScale,out vec3 hitPoint){
    vec3 backCenter=vec3(0.,0.,-thickness);
    vec3 originToCenter=rayOrigin-backCenter;

    float zScaleSq=zScale*zScale;
    float quadA=dot(rayDir.xy,rayDir.xy)+(rayDir.z*rayDir.z)/zScaleSq;
    float quadB=2.*(dot(originToCenter.xy,rayDir.xy)+(originToCenter.z*rayDir.z)/zScaleSq);
    float quadC=dot(originToCenter.xy,originToCenter.xy)+(originToCenter.z*originToCenter.z)/zScaleSq-1.;

    float discriminant=quadB*quadB-4.*quadA*quadC;
    if(discriminant<0.){
        return false;
    }

    float sqrtDiscriminant=sqrt(max(0.,discriminant));
    float tNear=(-quadB-sqrtDiscriminant)/(2.*quadA);
    float tFar=(-quadB+sqrtDiscriminant)/(2.*quadA);

    float hitTime;
    if(tNear>EPS){
        hitTime=tNear;
    }else{
        hitTime=tFar;
    }

    if(hitTime<=0.){
        return false;
    }

    hitPoint=rayOrigin+rayDir*hitTime;
    return true;
}

vec3 calcBackEllipsoidNormal(vec3 backPoint,float thickness,float zScale){
    vec3 backCenter=vec3(0.,0.,-thickness);
    vec3 local=backPoint-backCenter;
    float zScaleSq=zScale*zScale;

    return normalize(vec3(local.xy,local.z/zScaleSq));
}

vec2 traceRefractionDisplInRadii(vec2 unitDiskCoords,float ior,float zScale,float thickness){
    vec3 frontPoint;
    vec3 frontNormal;
    calcFrontSurfacePointAndNormal(unitDiskCoords,zScale,frontPoint,frontNormal);

    vec3 incomingAirDir=vec3(0.,0.,-1.);
    vec3 dirInsideGlass=refract(incomingAirDir,frontNormal,IOR_AIR/ior);
    if(length(dirInsideGlass)<EPS){
        return vec2(0.);
    }

    vec3 backSurfacePoint;
    bool didHit=intersectBackEllipsoid(frontPoint,dirInsideGlass,thickness,zScale,backSurfacePoint);
    if(!didHit){
        return vec2(0.);
    }

    vec3 backSurfaceNormal=calcBackEllipsoidNormal(backSurfacePoint,thickness,zScale);
    vec3 outgoingAirDir=refract(dirInsideGlass,-backSurfaceNormal,ior/IOR_AIR);
    if(length(outgoingAirDir)<EPS){
        return vec2(0.);
    }

    float timeToImagePlane=-backSurfacePoint.z/outgoingAirDir.z;
    vec2 projectedXY=backSurfacePoint.xy+outgoingAirDir.xy*timeToImagePlane;

    return(projectedXY-unitDiskCoords)*uRefractionDisplacementScale;
}

vec3 calcShadingNormal(vec2 unitDiskCoords,float zAxisDepth){
    return normalize(vec3(-unitDiskCoords,zAxisDepth));
}

void main(){
    vec2 invSourceSizePx=1./uSourceSizePx;

    vec2 sourceCenterUV=uLensCenterPx*invSourceSizePx;
    sourceCenterUV.y=1.-sourceCenterUV.y;

    vec2 unitDiskCoords=vQuadUV*2.-1.;
    float radiusSq=dot(unitDiskCoords,unitDiskCoords);
    float radius=sqrt(radiusSq);
    if(radius>1.){
        discard;
    }

    float zScale=clamp(uLensOblateness,.2,1.);

    vec2 magnificationUVOffset=calcMagnificationUVOffset(unitDiskCoords,invSourceSizePx);

    float iorRed=uLensIOR-uAberrationAmount;
    float iorGreen=uLensIOR;
    float iorBlue=uLensIOR+uAberrationAmount;

    vec2 displRadiiRed=traceRefractionDisplInRadii(unitDiskCoords,iorRed,zScale,uLensThickness);
    vec2 displRadiiGreen=traceRefractionDisplInRadii(unitDiskCoords,iorGreen,zScale,uLensThickness);
    vec2 displRadiiBlue=traceRefractionDisplInRadii(unitDiskCoords,iorBlue,zScale,uLensThickness);

    vec2 displUVRed=calcPixelOffsetUV(displRadiiRed,invSourceSizePx);
    vec2 displUVGreen=calcPixelOffsetUV(displRadiiGreen,invSourceSizePx);
    vec2 displUVBlue=calcPixelOffsetUV(displRadiiBlue,invSourceSizePx);

    float rimFeatherAmount=smoothstep(uBevelStartR,1.,radius);
    float edgeDisplAttenuation=1.-rimFeatherAmount*.12;

    vec2 uvRed=sourceCenterUV+magnificationUVOffset+displUVRed*edgeDisplAttenuation;
    vec2 uvGreen=sourceCenterUV+magnificationUVOffset+displUVGreen*edgeDisplAttenuation;
    vec2 uvBlue=sourceCenterUV+magnificationUVOffset+displUVBlue*edgeDisplAttenuation;

    vec3 refractedCol=vec3(
        texture2D(uSourceTex,uvRed).r,
        texture2D(uSourceTex,uvGreen).g,
        texture2D(uSourceTex,uvBlue).b
    );

    float zAxisDepth=sqrt(max(0.,1.-radiusSq));
    vec3 shadingNormal=calcShadingNormal(unitDiskCoords,zAxisDepth);
    vec3 viewDir=vec3(0.,0.,1.);
    vec3 lightDir=normalize(vec3(.35,.55,1.));

    float fresnelReflectanceAtNormal=pow((uLensIOR-1.)/(uLensIOR+1.),2.);
    float viewDotNormal=clamp(dot(viewDir,shadingNormal),0.,1.);
    float fresnel=fresnelReflectanceAtNormal+(1.-fresnelReflectanceAtNormal)*pow(1.-viewDotNormal,5.);

    vec3 halfVec=normalize(viewDir+lightDir);
    float specular=pow(max(dot(shadingNormal,halfVec),0.),80.)*.35;

    float rimBoostAmount=smoothstep(.78,.98,radius)*.5;
    float innerDimAmount=smoothstep(.55,1.,radius)*.18;

    vec3 highlightCol=vec3(specular*fresnel)+vec3(rimBoostAmount*fresnel);
    vec3 shadedCol=refractedCol*(1.-innerDimAmount)+highlightCol;

    gl_FragColor=vec4(shadedCol,1.);
}
`;

// Strong glass defaults — closer to the marj `Lens` component's own defaults
// (IOR 1.52 / aberration 0.05 / fat oblate lens) than the toned-down values the
// marj *loupe* shipped with (1.4 / 0.01 / 0.5). All overridable per-instance and
// via URL knobs (see image-loupe.tsx) so the effect is easy to dial and compare.
const DEFAULTS = {
  ior: 1.5,
  chromaticAberration: 0.06,
  lensThickness: 1.0,
  bevelStart: 0.85,
  oblateZScale: 0.7,
  refractionScale: 0.9,
};

const LoupeLensMaterial = shaderMaterial(
  {
    uSourceTex: null,
    uSourceSizePx: new THREE.Vector2(1, 1),
    uLensCenterPx: new THREE.Vector2(),
    uLensMagnification: 1.0,
    uLensIOR: DEFAULTS.ior,
    uAberrationAmount: DEFAULTS.chromaticAberration,
    uLensThickness: DEFAULTS.lensThickness,
    uBevelStartR: DEFAULTS.bevelStart,
    uLensRadiusPx: 80.0,
    uLensOblateness: DEFAULTS.oblateZScale,
    uRefractionDisplacementScale: DEFAULTS.refractionScale,
  },
  vertexShader,
  fragmentShader,
);

extend({ LoupeLensMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    loupeLensMaterial: ThreeElement<typeof LoupeLensMaterial>;
  }
}

type LensMat = THREE.ShaderMaterial & {
  uniforms: {
    uSourceTex: { value: THREE.Texture | null };
    uSourceSizePx: { value: THREE.Vector2 };
    uLensCenterPx: { value: THREE.Vector2 };
    uLensMagnification: { value: number };
    uLensIOR: { value: number };
    uAberrationAmount: { value: number };
    uLensThickness: { value: number };
    uBevelStartR: { value: number };
    uLensRadiusPx: { value: number };
    uLensOblateness: { value: number };
    uRefractionDisplacementScale: { value: number };
  };
};

/** Imperative state the parent writes each frame, in container CSS px. */
export interface LoupeLensState {
  x: number;
  y: number;
  zoom: number;
  w: number;
  h: number;
}

interface GlassLensProps {
  src: string;
  stateRef: { current: LoupeLensState };
  ior?: number;
  chromaticAberration?: number;
  lensThickness?: number;
  bevelStart?: number;
  oblateZScale?: number;
  refractionScale?: number;
}

/** Loads `src` into a clamped, non-mipmapped texture; disposes on unmount/change. */
function useImageTexture(src: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let created: THREE.Texture | null = null;
    let disposed = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      created = new THREE.Texture(img);
      created.flipY = true;
      created.wrapS = THREE.ClampToEdgeWrapping;
      created.wrapT = THREE.ClampToEdgeWrapping;
      created.minFilter = THREE.LinearFilter;
      created.magFilter = THREE.LinearFilter;
      created.generateMipmaps = false;
      created.needsUpdate = true;
      setTexture(created);
    };
    img.src = src;

    return () => {
      disposed = true;
      created?.dispose();
      setTexture(null);
    };
  }, [src]);

  return texture;
}

function LensScene({
  texture,
  stateRef,
  ior = DEFAULTS.ior,
  chromaticAberration = DEFAULTS.chromaticAberration,
  lensThickness = DEFAULTS.lensThickness,
  bevelStart = DEFAULTS.bevelStart,
  oblateZScale = DEFAULTS.oblateZScale,
  refractionScale = DEFAULTS.refractionScale,
}: GlassLensProps & { texture: THREE.Texture }) {
  const matRef = useRef<LensMat>(null!);

  useEffect(() => {
    const u = matRef.current.uniforms;
    u.uSourceTex.value = texture;
    u.uLensIOR.value = ior;
    u.uAberrationAmount.value = Math.max(0, chromaticAberration);
    u.uLensThickness.value = lensThickness;
    u.uBevelStartR.value = bevelStart;
    u.uLensOblateness.value = oblateZScale;
    u.uRefractionDisplacementScale.value = refractionScale;
  }, [
    texture,
    ior,
    chromaticAberration,
    lensThickness,
    bevelStart,
    oblateZScale,
    refractionScale,
  ]);

  // Seed the damped magnification so the first frame opens at the real zoom.
  useEffect(() => {
    matRef.current.uniforms.uLensMagnification.value = stateRef.current.zoom;
  }, [stateRef]);

  useFrame((state, dt) => {
    const u = matRef.current.uniforms;
    const s = stateRef.current;
    u.uSourceSizePx.value.set(s.w || 1, s.h || 1);
    u.uLensCenterPx.value.set(s.x, s.y);
    u.uLensRadiusPx.value = Math.min(state.size.width, state.size.height) * 0.5;
    u.uLensMagnification.value = THREE.MathUtils.damp(
      u.uLensMagnification.value,
      s.zoom,
      35,
      dt,
    );
  });

  return (
    <ScreenQuad>
      <loupeLensMaterial ref={matRef} />
    </ScreenQuad>
  );
}

export function GlassLens({ src, stateRef, ...optics }: GlassLensProps) {
  const texture = useImageTexture(src);

  return (
    <Canvas
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        borderRadius: "inherit",
        pointerEvents: "none",
        zIndex: 1,
      }}
      gl={{ alpha: true, antialias: false, premultipliedAlpha: true }}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      dpr={[1, 2]}
    >
      {texture && (
        <LensScene texture={texture} src={src} stateRef={stateRef} {...optics} />
      )}
    </Canvas>
  );
}

"use client";

// Faithful port of the marj loupe Lens (Loupe/Lens/Lens.tsx). Only changes:
// the GLSL is inlined as strings (this build has no .frag/.vert loader), the
// store import is local, and the extend()'d material is renamed to avoid the
// global r3f catalog colliding with the other loupe-lens material in this app.
// Optics defaults and uniforms are otherwise identical to the original.

import { ScreenQuad, shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame, type ThreeElement } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useLoupeStore } from "./store";

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

type ImageSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

interface LensProps {
  image?: ImageSource;
  width: number;
  height: number;
  sourceWidth?: number;
  sourceHeight?: number;
  magnification?: number;
  ior?: number;
  chromaticAberration?: number;
  lensThickness?: number;
  bevelStart?: number;
  oblateZScale?: number;
  refractionScale?: number;
  className?: string;
  style?: React.CSSProperties;
}

const MarjLensMaterial = shaderMaterial(
  {
    uSourceTex: null,
    uSourceSizePx: new THREE.Vector2(1, 1),
    uLensCenterPx: new THREE.Vector2(),

    uLensMagnification: 1.0,
    uLensIOR: 1.52,
    uAberrationAmount: 0.05,
    uLensThickness: 0.9,
    uBevelStartR: 0.9,
    uLensRadiusPx: 64.0,
    uLensOblateness: 0.65,
    uRefractionDisplacementScale: 0.6,
  },
  vertexShader,
  fragmentShader,
);

extend({ MarjLensMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    marjLensMaterial: ThreeElement<typeof MarjLensMaterial>;
  }
}

type LensMatImpl = THREE.ShaderMaterial & {
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

function imageToTexture(image: ImageSource) {
  const texture = (image as HTMLCanvasElement).getContext
    ? new THREE.CanvasTexture(image as HTMLCanvasElement)
    : new THREE.Texture(image as HTMLImageElement);
  texture.flipY = true;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function LensScene({
  image,
  width,
  height,
  magnification = 1,
  ior = 1.52,
  chromaticAberration = 0.05,
  lensThickness = 0.9,
  bevelStart = 0.9,
  oblateZScale = 0.65,
  refractionScale = 0.6,
  sourceWidth: sourceWidthOverride,
  sourceHeight: sourceHeightOverride,
  texture,
}: LensProps & { texture: THREE.Texture }) {
  const matRef = useRef<LensMatImpl>(null!);

  useEffect(() => {
    if (!matRef.current) return;
    const sourceWidth = sourceWidthOverride ?? (image as HTMLImageElement | undefined)?.width ?? 1;
    const sourceHeight = sourceHeightOverride ?? (image as HTMLImageElement | undefined)?.height ?? 1;

    const u = matRef.current.uniforms;
    u.uSourceTex.value = texture;
    u.uSourceSizePx.value.set(sourceWidth, sourceHeight);
    u.uLensMagnification.value = magnification;
    u.uLensIOR.value = ior;
    u.uAberrationAmount.value = Math.max(0, chromaticAberration);
    u.uLensThickness.value = lensThickness;
    u.uBevelStartR.value = bevelStart;
    u.uLensRadiusPx.value = Math.min(width, height) * 0.5;
    u.uLensOblateness.value = oblateZScale;
    u.uRefractionDisplacementScale.value = refractionScale;
  }, [
    image,
    texture,
    width,
    height,
    magnification,
    ior,
    chromaticAberration,
    lensThickness,
    bevelStart,
    oblateZScale,
    refractionScale,
    sourceWidthOverride,
    sourceHeightOverride,
  ]);

  const scaleRef = useRef(useLoupeStore.getState().scale);
  const coordsRef = useRef(useLoupeStore.getState().coords);

  useEffect(() => {
    const unsub = useLoupeStore.subscribe((v) => {
      scaleRef.current = v.scale;
      coordsRef.current = v.coords;
    });
    return unsub;
  }, []);

  useFrame((_, dt) => {
    const u = matRef.current.uniforms;
    u.uLensMagnification.value = THREE.MathUtils.damp(
      u.uLensMagnification.value,
      scaleRef.current,
      35,
      dt,
    );
    const { x, y } = coordsRef.current;
    u.uLensCenterPx.value.set(x, y);
  });

  return (
    <ScreenQuad>
      <marjLensMaterial ref={matRef} />
    </ScreenQuad>
  );
}

export default function Lens({
  image,
  width,
  height,
  ior,
  chromaticAberration,
  lensThickness,
  bevelStart,
  oblateZScale = 0.5,
  refractionScale = 0.5,
  sourceWidth,
  sourceHeight,
  className,
  style,
}: LensProps) {
  const texture = useMemo(() => (image ? imageToTexture(image) : null), [image]);

  return (
    <Canvas
      className={className}
      style={{ width, height, borderRadius: 9999, ...style }}
      gl={{ alpha: true, antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: true }}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
      }}
    >
      {texture && (
        <LensScene
          image={image}
          width={width}
          height={height}
          ior={ior}
          chromaticAberration={chromaticAberration}
          lensThickness={lensThickness}
          bevelStart={bevelStart}
          oblateZScale={oblateZScale}
          refractionScale={refractionScale}
          sourceWidth={sourceWidth}
          sourceHeight={sourceHeight}
          texture={texture}
        />
      )}
    </Canvas>
  );
}

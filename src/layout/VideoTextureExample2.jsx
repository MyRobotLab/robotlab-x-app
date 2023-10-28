import React, { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react"
import { HUD2 } from "../components/webxr/HUD2"
import { useFrame, createPortal, useThree, Canvas, PlaneGeometry } from "@react-three/fiber"
import { useXR } from "@react-three/xr"
import { deltaPose, getEvent, getPose } from "../framework/WebXrUtils"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import {
  Pane,
  Plane,
  useFBO,
  OrthographicCamera,
  OrbitControls,
  Box,
  Text,
  Html,
  Image,
  useTexture,
  useAspect,
  useVideoTexture,
} from "@react-three/drei"
import { VideoTexture, UniformsUtils } from "three"
import store from "../store/store"
import * as THREE from "three"

function Scene3({ url }) {
  const size = useAspect(4, 3)
  return (
    <mesh size={size} position={[0, 1, -1]}>
      <planeGeometry />
      <Suspense fallback={<FallbackMaterial url="logo.jpg" />}>
        <VideoMaterial url={url} />
      </Suspense>
    </mesh>
  )
}

function VideoMaterial({ url }) {
  const texture = useVideoTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function FallbackMaterial({ url }) {
  const texture = useTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function VideoTextureExample2() {
  const url = "/geographic.mp4"

  return (
    <>
      <VRButton />
      <Canvas>
        <ambientLight intensity={0.5} /> {/* Adjust the ambient light intensity */}
        <pointLight position={[5, 5, 5]} intensity={0.8} /> {/* Adjust the point light position and intensity */}
        <XR>
          <Scene3 url={url} />
        </XR>
      </Canvas>
    </>
  )
}

export default VideoTextureExample2

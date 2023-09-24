import React, { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react"
import { RuntimeContext } from "../framework/RuntimeContext"
import { HUD } from "./HUD"
import { useFrame, createPortal, useThree, Canvas } from "react-three-fiber"
import { useXR } from "@react-three/xr"
import { deltaPose, getEvent, getPose } from "../framework/WebXrUtils"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { Pane, Plane, useFBO, OrthographicCamera, Box, Text, Html } from "@react-three/drei"
import { VideoTexture, UniformsUtils } from "three"
// import { MinimumShader } from "./minimum"

import * as THREE from "three"
import { useVideoTexture, Center } from "@react-three/drei"
import CurvedPlane from "./CurvedPlane"
const { DEG2RAD } = THREE.MathUtils

export default function WebXR() {
  return (
    <>
      <VRButton />
      <Canvas>
        {/*<Video video={videoRef} />*/}
        <XR>
          <Controllers />
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <HUD />
          <Scene />
        </XR>
      </Canvas>
    </>
  )
}

function Scene() {
  const url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  return (
    <>
      <group rotation-y={DEG2RAD * 40}>
        <Screen src={url} />
      </group>
    </>
  )
}

function Screen({ src }) {
  const [video, setVideo] = useState()

  const ratio = 16 / 9
  const width = 5
  const radius = 4
  const z = 4

  const r = useMemo(() => (video ? video.videoWidth / video.videoHeight : ratio), [video, ratio])

  return (
    <group>
      <Center top position-z={z}>
        <CurvedPlane width={width} height={width / r} radius={radius}>
          <Suspense fallback={<meshStandardMaterial side={THREE.DoubleSide} wireframe />}>
            <VideoMaterial src={src} setVideo={setVideo} />
          </Suspense>
        </CurvedPlane>
      </Center>
    </group>
  )
}

function VideoMaterial({ src, setVideo }) {
  const texture = useVideoTexture(src)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.x = -1
  texture.offset.x = 1

  setVideo?.(texture.image)

  return <meshStandardMaterial side={THREE.DoubleSide} map={texture} toneMapped={false} transparent opacity={0.9} />
}

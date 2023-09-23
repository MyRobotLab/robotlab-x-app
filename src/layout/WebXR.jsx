import React, { useRef, useEffect, useContext, useState } from "react"
import { RuntimeContext } from "../framework/RuntimeContext"
import {HUD} from "./HUD"
import { useFrame, createPortal, useThree, Canvas } from "react-three-fiber"
import { useXR } from "@react-three/xr"
import { deltaPose, getEvent, getPose } from "../framework/WebXrUtils"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { Pane, Plane, useFBO, OrthographicCamera, Box, Text, Html } from "@react-three/drei"
import { VideoTexture } from "three"
const videoSource = process.env.PUBLIC_URL + "/assets/buck.mp4"

export default function WebXR () {
  return (
    <>
      <VRButton />
      <Canvas>
        <XR>
          <Controllers />
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <HUD />

        </XR>
      </Canvas>
    </>
  )
}

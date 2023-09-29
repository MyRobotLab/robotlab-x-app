import React, { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react"
import { RuntimeContext } from "../framework/RuntimeContext"
import { HUD } from "./HUD"
import { useFrame, createPortal, useThree, Canvas } from "react-three-fiber"
import { useXR } from "@react-three/xr"
import { deltaPose, getEvent, getPose } from "../framework/WebXrUtils"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { Pane, Plane, useFBO, OrthographicCamera, Box, Text, Html, Image } from "@react-three/drei"
import { VideoTexture, UniformsUtils } from "three"
import useSubscriptionStore from "../store/subscriptionStore"

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
          {/*         
          <Plane args={[5, 5]} position={[0, 0, 0]}>
            <meshBasicMaterial attach="material">
              <texture url="/logo.png" />
            </meshBasicMaterial>
          </Plane> */}
          {/*}
          <Image position={[0, 1, -2]} url="/logo.png" /> */}

          <HUD />
          <OpenCV name="i01.opencv@blah" />
          <Scene />
        </XR>
      </Canvas>
    </>
  )
}

function OpenCV(props) {
  // const { subscribe, unsubscribe } = useContext(RuntimeContext)
  const { subscribe, unsubscribe } = useSubscriptionStore()
  const [imageData, setImageData] = useState("/Blender.png")

  console.log("OpenCV name", props.name)

  let img = "/Blender.png"
  let key = "1"

  useFrame(() => {
    console.log(img)
  })

  // useEffect(() => {
  //   const onPublishWebDisplay = (message) => {
  //     console.log(`Message received: ${message}`)
  //     // You can perform actions based on the received message here
  //   }

  //   // Subscribe with a unique name, method, and callback
  //   subscribe("i01.opencv@blah", "onPublishWebDisplay", onPublishWebDisplay)

  //   return () => {
  //     // Unsubscribe when the component unmounts
  //     unsubscribe("i01.opencv@blah", "onPublishWebDisplay", onPublishWebDisplay)
  //   }
  // }, [subscribe, unsubscribe])

  const handleCallback = (message) => {
    // console.log(`received message: ${message}`)
    let inData = message.data[0]
    img = inData.data
    // img = "https://cdn.pixabay.com/photo/2014/06/03/19/38/road-sign-361514_960_720.png"
    // img = "/logo.png"
    // key = Date.now() + ""
    setImageData(img)
    // You can perform any actions you want with the received message here
  }

  useEffect(() => {
    // Define your callback method
    // Subscribe to a method with a name and provide the callback
    subscribe("exampleMethod", "exampleMethodName", handleCallback)

    // Unsubscribe when the component unmounts or when no longer needed
    return () => {
      unsubscribe("exampleMethod") // Unsubscribe by the method name
    }
  }, [subscribe, unsubscribe])

  return (
    <group>
      <Image position={[0, 1, -2]} key={key} url={imageData} />
    </group>
  )
}

function Scene() {
  // const url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  const url =
    "https://pmdvod.nationalgeographic.com/NG_Video/596/311/1370718787631_1542234923394_1370715715931_mp4_video_1024x576_1632000_primary_audio_eng_3.mp4"
  return (
    <>
      <group rotation-y={DEG2RAD * 180}>
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

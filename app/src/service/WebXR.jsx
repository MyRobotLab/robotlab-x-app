import * as THREE from "three"
import { useState, Suspense, useMemo, useEffect } from "react"
import { Canvas, createPortal, useThree } from "@react-three/fiber"
import { useAspect, useVideoTexture, Grid, Center, RandomizedLight, Environment, CameraControls } from "@react-three/drei"
import { VRButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { suspend } from "suspend-react"
import { HUD2 } from "../components/webxr/HUD2"

import CurvedPlane from "../components/webxr/CurvedPlane"
const city = import("@pmndrs/assets/hdri/city.exr")

const { DEG2RAD } = THREE.MathUtils

// CameraControls will override webxr controls
// 4, 3, 12
export default function WebXR(props) {
  return (
    <>
      <VRButton />
      <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [4, 3, 0], fov: 60 }}>
        <XR>
          {/*
          <Scene />
          */}
          <LinkedView />
          <Ground />
          <RandomizedLight amount={8} radius={4}/>
          {/*}
          <CameraControls />
          */}
          <Controllers />
          <HUD2 name={props.name} />
          <Environment files={suspend(city).default} />
        </XR>
      </Canvas>
        </div>
    </>
  )
}

function Scene() {
  const [stream, setStream] = useState(new MediaStream())
  // FIXME (menu) - add again as options
  const [useSTUN, setUseSTUN] = useState(false)

  let pc = null
  let protocol = window.location.protocol
  let host = window.location.hostname
  let webrtc_url = protocol + "//" + host + ":8080"

  function negotiate() {
    pc.addTransceiver("video", { direction: "recvonly" })
    pc.addTransceiver("audio", { direction: "recvonly" })
    return pc
      .createOffer()
      .then(function (offer) {
        return pc.setLocalDescription(offer)
      })
      .then(function () {
        return new Promise(function (resolve) {
          if (pc.iceGatheringState === "complete") {
            resolve()
          } else {
            function checkState() {
              if (pc.iceGatheringState === "complete") {
                pc.removeEventListener("icegatheringstatechange", checkState)
                resolve()
              }
            }
            pc.addEventListener("icegatheringstatechange", checkState)
          }
        })
      })
      .then(function () {
        var offer = pc.localDescription
        return fetch(`${webrtc_url}/offer`, {
          body: JSON.stringify({
            sdp: offer.sdp,
            type: offer.type,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      })
      .then(function (response) {
        return response.json()
      })
      .then(function (answer) {
        return pc.setRemoteDescription(answer)
      })
      .catch(function (e) {
        alert(e)
      })
  }

  function start() {
    console.info("starting webrtc peer connection negotiation")
    var config = {
      sdpSemantics: "unified-plan",
    }

    // FIXME (menu) - stun
    // FIXME (menu) - add again as options
    // if (document.getElementById("use-stun").checked) {
    //   config.iceServers = [{ urls: ["stun:stun.l.google.com:19302"] }]
    // }

    pc = new RTCPeerConnection(config)

    pc.addEventListener("track", function (evt) {
      if (evt.track.kind === "video") {
        setStream(evt.streams[0])
      } else {
        // setAudioStream(evt.streams[0])
      }
    })
    negotiate()
  }

  // FIXME - renable stop?
  function stop() {
    document.getElementById("stop").style.display = "none"
    setTimeout(function () {
      pc.close()
    }, 500)
  }

  useEffect(() => {
    // start webrtc
    start()
  }, [])

  // FIXME - add multiple screens dynamically !
  return (
    <>
      {/*
      <group position={[0, -2, 0]} rotation-y={DEG2RAD * -180}>
        <Screen src={stream} />
      </group>
      */}
      <group position={[0, 0, -35]}>
              <Suspense fallback={<meshStandardMaterial side={THREE.DoubleSide} wireframe />}>

      <Screen2  src={stream}  />
                </Suspense>
      </group>
      
    </>
  )
}


function Screen2({ src, setVideo }) {

  const size = useAspect(1280, 720)
  const texture = useVideoTexture(src)

  return (
    <mesh scale={size}>
      <planeGeometry/>
      {/*
       <meshBasicMaterial map={texture} toneMapped={false} />
       */}
      <meshStandardMaterial side={THREE.DoubleSide} map={texture} toneMapped={false} transparent />
        
    </mesh>
  )

}


function Screen({ src }) {
  const [video, setVideo] = useState()

  const ratio = 16 / 9
  const width = 5
  const radius = 12
  const z = 2

  const r = useMemo(() => (video ? video.videoWidth / video.videoHeight : ratio), [video, ratio])

  return (
    <Center top position-z={z}>
      <CurvedPlane width={width} height={width / r} radius={radius}>
        <Suspense fallback={<meshStandardMaterial side={THREE.DoubleSide} wireframe />}>
          <VideoMaterial src={src} setVideo={setVideo} />
        </Suspense>
      </CurvedPlane>
    </Center>
  )
}

function VideoMaterial({ src, setVideo }) {
  const texture = useVideoTexture(src)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  // for multiple screens
  // texture.repeat.x = -1
  // texture.offset.x = 1

  return <meshStandardMaterial side={THREE.DoubleSide} map={texture} toneMapped={false} transparent />
}

function Ground() {
  const gridConfig = {
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: "#6f6f6f",
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: "#9d4b4b",
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true,
  }
  return <Grid position={[0, -20, 0]} args={[10.5, 10.5]} {...gridConfig} />
}

function LinkedView() {
  console.info("LinedView start")

  const camera = useThree((state) => state.camera)
  return createPortal(<Scene position={[0, 0, 0]} />, camera)
}

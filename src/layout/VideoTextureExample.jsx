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
  Center,
  useVideoTexture,
} from "@react-three/drei"
import { VideoTexture, UniformsUtils } from "three"
import store from "../store/store"
import * as THREE from "three"
import CurvedPlane from "./CurvedPlane"

function Scene3({ url }) {
  const size = useAspect(4, 3)
  return (
    <mesh size={size} position={[0, 1, -1]}>
      <planeGeometry />
      <Suspense fallback={<FallbackMaterial url="logo.jpg" />}>
        <VideoMaterial2 url={url} />
      </Suspense>
    </mesh>
  )
}

function Screen({ src, video, setVideo }) {
  // const [video, setVideo] = useState()

  const ratio = 16 / 9
  const width = 5
  const radius = 4
  const z = 4

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
  texture.repeat.x = -1
  texture.offset.x = 1

  setVideo?.(texture.image)

  return <meshStandardMaterial side={THREE.DoubleSide} map={texture} toneMapped={false} transparent opacity={0.9} />
}

function VideoMaterial2({ url }) {
  const texture = useVideoTexture(url)

  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function FallbackMaterial({ url }) {
  const texture = useTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function VideoTextureExample() {
  const [useSTUN, setUseSTUN] = useState(false)
  const [stream, setStream] = useState(new MediaStream())
  let pc = null
  let videoStream = null

  let protocol = window.location.protocol
  let host = window.location.hostname
  let webrtc_url = protocol + "//" + host + ":8080"
  const url = "/geographic.mp4"
  // const url = protocol + "//" + host + ":8080"

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
    var config = {
      sdpSemantics: "unified-plan",
    }

    if (document.getElementById("use-stun").checked) {
      config.iceServers = [{ urls: ["stun:stun.l.google.com:19302"] }]
    }

    pc = new RTCPeerConnection(config)

    pc.addEventListener("track", function (evt) {
      if (evt.track.kind === "video") {
        document.getElementById("video").srcObject = evt.streams[0]
        // THIS IS A MEDIASTREAM !!!
        setStream(evt.streams[0])
      } else {
        document.getElementById("audio").srcObject = evt.streams[0]
      }
    })

    document.getElementById("start").style.display = "none"
    negotiate()
    document.getElementById("stop").style.display = "inline-block"
  }

  function stop() {
    document.getElementById("stop").style.display = "none"
    setTimeout(function () {
      pc.close()
    }, 500)
  }

  function moveStream() {
    console.info("moveStream")
    // setStream(videoStream)
  }

  return (
    <>
      <div className="option">
        <input id="use-stun" type="checkbox" checked={useSTUN} onChange={() => setUseSTUN(!useSTUN)} />
        <label htmlFor="use-stun">Use STUN server</label>
      </div>
      <button id="start" onClick={start}>
        Start
      </button>
      <button id="stop" onClick={stop}>
        Stop
      </button>
      <button id="moveStream" onClick={moveStream}>
        Move Stream
      </button>

      <div id="media">
        <h2>Media</h2>

        <audio id="audio" autoPlay={true}></audio>
        <video id="video" autoPlay={true} playsInline={true}></video>
      </div>
      <VRButton />
      <Canvas>
        <ambientLight intensity={0.5} /> {/* Adjust the ambient light intensity */}
        <pointLight position={[5, 5, 5]} intensity={0.8} /> {/* Adjust the point light position and intensity */}
        <XR>
          <Screen src={url} video={stream} setVideo={setStream} />
        </XR>
      </Canvas>
    </>
  )
}

export default VideoTextureExample

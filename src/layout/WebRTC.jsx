import React, { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react"
import { useFrame, createPortal, useThree, Canvas } from "@react-three/fiber"
import { useXR } from "@react-three/xr"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { Pane, Plane, useFBO, OrthographicCamera, Box, Text, Html, Image } from "@react-three/drei"
import { VideoTexture, UniformsUtils } from "three"
import { useVideoTexture, Center } from "@react-three/drei"
import * as THREE from "three"


const WebRTC = () => {
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
  

  return (
    <>
      {webrtc_url}
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

      <div id="media">
        <h2>Media</h2>

        <audio id="audio" autoPlay={true}></audio>
        <video id="video" autoPlay={true} playsInline={true}></video>
      </div>
    </>
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


export default WebRTC

import React, { useRef, useEffect, useContext, useState } from "react"
import { RuntimeContext } from "../framework/RuntimeContext"

import { useFrame, createPortal, useThree, Canvas } from "react-three-fiber"
import { useXR } from "@react-three/xr"
import { deltaPose, getEvent, getPose } from "../framework/WebXrUtils"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { Pane, Plane, useFBO, OrthographicCamera, Box, Text, Html } from "@react-three/drei"
import { VideoTexture } from "three"
const videoSource = process.env.PUBLIC_URL + "/assets/buck.mp4"

export const HUD = (props) => {
  const videoRef = useRef()
  const videoTexture = useRef()
  const { message, sendMessage, readyState, sendTo } = useContext(RuntimeContext)
  // const { controllerData, setControllersData } = useState({})
  const threshold = 0.01

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  const [controllerData, setControllerData] = useState({})

  let precision = 2

  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()

  const {
    // An array of connected `XRController`
    controllers,
    // Whether the XR device is presenting in an XR session
    isPresenting,
    // Whether hand tracking inputs are active
    isHandTracking,
    // A THREE.Group representing the XR viewer or player
    player,
    // The active `XRSession`
    session,
    // `XRSession` foveation. This can be configured as `foveation` on <XR>. Default is `0`
    foveation,
    // `XRSession` reference-space type. This can be configured as `referenceSpace` on <XR>. Default is `local-floor`
    referenceSpace,
  } = useXR()

  const left = useController("left")
  const right = useController("right")
  const headset = useController("none")

  const handleSqeezeStart = (xrEvent) => {
    let event = getEvent(xrEvent)
    sendTo("webxr", "publishEvent", event)
  }

  const handleSqueezeEnd = (xrEvent) => {
    let event = getEvent(xrEvent)
    sendTo("webxr", "publishEvent", event)
  }

  useXREvent("squeezestart", handleSqeezeStart)
  useXREvent("squeezeend", handleSqueezeEnd)

  useEffect(() => {
    if (videoRef.current) {
      // Create a VideoTexture from the video element after it has loaded
      videoRef.current.onloadedmetadata = () => {
        videoTexture.current = new VideoTexture(videoRef.current)
        // Force re-render to apply texture
      }
    }
  }, [])

  // callback only happens when in VR
  // data changes only happen when in VR
  useFrame(() => {
    if (controllers.length >= 2) {
      // left ... maybe
      let p = left.controller.position
      let r = left.controller.rotation
      // console.info(pose.position)

      let pose = getPose("left", p, r)

      if (deltaPose(pose, controllerData[pose.name], threshold)) {
        let data = { left: pose }
        setControllerData((controllerData) => ({ ...controllerData, ...data }))
        console.log(controllerData)
        sendTo("webxr", "publishPose", pose)
      }

      // right ... maybe
      p = right.controller.position
      r = right.controller.rotation
      // console.info(pose.position)

      pose = getPose("right", p, r)

      if (deltaPose(pose, controllerData[pose.name], threshold)) {
        let data = { right: pose }
        setControllerData((controllerData) => ({ ...controllerData, ...data }))
        console.log(controllerData)
        sendTo("webxr", "publishPose", pose)
      }
      // console.info(controllers[1].controller.position)
      // console.info(left.position)
    }

    if (player) {
      // head ... maybe
      let p = player.children[0].position
      let r = player.children[0].rotation
      // console.info(pose.position)

      let pose = getPose("head", p, r)

      if (deltaPose(pose, controllerData[pose.name], threshold)) {
        let data = { head: pose }
        setControllerData((controllerData) => ({ ...controllerData, ...data }))
        sendTo("webxr", "publishPose", pose)
      }
    }

    // TODO - get joystick info here
    if (session) {
      //console.info(session)

      session.inputSources.forEach((inputSource) => {
        // Check if the input source has a gamepad
        if (inputSource.gamepad) {
          // Access the thumbstick (joystick) position from the axes array
          const [xAxis, yAxis] = inputSource.gamepad.axes

          // The joystick position is represented as values between -1 and 1
          // console.log(`Joystick X-axis position: ${inputSource.handedness} ${xAxis}`);
          // console.log(`Joystick Y-axis position: ${yAxis}`);
        }
      })
    }

    // setCounter((counter) => counter + 1)
  }) // useFrame

  function formatPose(poseName) {
    if (controllerData[poseName]) {
      let p = controllerData[poseName].position
      let r = controllerData[poseName].orientation
      return (
        <Text position={[0, 1.8, -1.8]} scale={0.04}>
          {poseName}{'\n'}position: {p.x.toFixed(precision)}, {p.y.toFixed(precision)},{p.z.toFixed(precision)}{'\n'}
          orientation: ${r.pitch.toFixed(precision)},{r.roll.toFixed(precision)},{r.yaw.toFixed(precision)}{'\n'}
        </Text>
      )
    }
  }

  return (
    <group>
      <mesh
        {...props}
        ref={ref}
        scale={clicked ? 1.5 : 0.05}
        onClick={(event) => click(!clicked)}
        onPointerOver={(event) => (event.stopPropagation(), hover(true))}
        onPointerOut={(event) => hover(false)}
      ></mesh>
      {/*}
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
  */}
      {formatPose("head")}
    </group>
  )
}

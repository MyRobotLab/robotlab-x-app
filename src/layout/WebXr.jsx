import React, { useRef, useEffect, useContext } from "react"
import { RuntimeContext } from "../framework/RuntimeContext"

import { useFrame, createPortal, useThree, Canvas } from "react-three-fiber"
import { useXR } from "@react-three/xr"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { Pane, Plane, useFBO, OrthographicCamera, Box, Text, Html } from "@react-three/drei"
import { VideoTexture } from "three"
const videoSource = process.env.PUBLIC_URL + "/assets/buck.mp4"

function deltaPose(pose0, pose1, threshold) {
  if (!pose0 || !pose1) {
    return true
  }

  return (
    Math.abs(pose0.position.x - pose1.position.x) > threshold ||
    Math.abs(pose0.position.y - pose1.position.y) > threshold ||
    Math.abs(pose0.position.z - pose1.position.z) > threshold ||
    Math.abs(pose0.orientation.roll - pose1.orientation.roll) > threshold ||
    Math.abs(pose0.orientation.pitch - pose1.orientation.pitch) > threshold ||
    Math.abs(pose0.orientation.yaw - pose1.orientation.yaw) > threshold
  )
}

function getPose(name, position, orientation) {
  return {
    name: name,
    position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    orientation: {
      roll: orientation._z,
      pitch: orientation._x,
      yaw: orientation._y,
    },
  }
}

function getEvent(xrEvent) {
  let event = {
    id: xrEvent?.target?.uuid,
    type: xrEvent?.nativeEvent?.type,
    value: true,
    meta: {
      handedness: xrEvent?.target?.inputSource.handedness,
    },
  }
  return event
}

let lastPoses = {}

function HUD() {
  const { message, sendMessage, readyState, sendTo } = useContext(RuntimeContext)
  const threshold = 0.01

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

  const leftController = useController("left")
  const rightController = useController("right")
  const headset = useController("none")

  const handleSqeezeStart = (xrEvent) => {
    let event = getEvent(xrEvent)
    sendTo("webxr", "publishEvent", event)
  }

  const handleSqueezeEnd = (xrEvent) => {
    let event = getEvent(xrEvent)
    sendTo("webxr", "publishEvent", event)
  }

  // TODO - what is the advantage of using zustrand - sharing data with other components?
  // const player = useXR((state) => state.player)
  // const controllers = useXR((state) => state.controllers)

  const textRef = useRef()

  // useXREvent('inputsourceselect', handleXRInput);
  // useXREvent('squeeze', handleSqueeze)
  useXREvent("squeezestart", handleSqeezeStart)
  useXREvent("squeezeend", handleSqueezeEnd)

  // data changes only happen when in VR
  useFrame(() => {
    if (controllers.length >= 2) {
      // left ... maybe
      let p = leftController.controller.position
      let r = leftController.controller.rotation
      // console.info(pose.position)

      let pose = getPose("left", p, r)

      if (deltaPose(pose, lastPoses[pose.name], threshold)) {
        sendTo("webxr", "publishPose", pose)
      }
      lastPoses[pose.name] = pose

      // right ... maybe
      p = rightController.controller.position
      r = rightController.controller.rotation
      // console.info(pose.position)

      pose = getPose("right", p, r)

      if (deltaPose(pose, lastPoses[pose.name], threshold)) {
        sendTo("webxr", "publishPose", pose)
      }
      lastPoses[pose.name] = pose
      // console.info(controllers[1].controller.position)
      // console.info(leftController.position)
    }

    if (player) {
      // head ... maybe
      let p = player.children[0].position
      let r = player.children[0].rotation
      // console.info(pose.position)

      let pose = getPose("head", p, r)

      if (deltaPose(pose, lastPoses[pose.name], threshold)) {
        sendTo("webxr", "publishPose", pose)
      }
      lastPoses[pose.name] = pose
    }

    if (textRef.current && controllers) {
      textRef.current.position.copy(controllers[0].position)
      textRef.current.position.y -= 0.2 // Adjust the Y position as needed
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
  }) // useFrame

  function Object(ComponentProps) {
    return (
      <Box position={[0, 0.0, -1]} args={[1, 1, 0.01]}>
        <meshStandardMaterial color="lightgrey" />
        <Text position={[0, 0, 0.06]} fontSize={0.05} color="#000" anchorX="center" anchorY="middle">          
          x {leftController?.controller?.position?.x?.toFixed(2)}
          head {player?.children[0]?.position?.x?.toFixed(2)}
        </Text>      
      </Box>
    )
  }
  
  function CameraLinkedObject() {
    const camera = useThree((state) => state.camera)
    return createPortal(<Object position={[0, 0.6, -1]} />, camera)
  }
  const camera = useThree((state) => state.camera)
  
  let p = leftController?.controller?.position
  let r = leftController?.controller?.rotation


  return (
    <>
      <CameraLinkedObject />
      <Box position={[0, 0.0, -1]} args={[1, 1, 0.01]}>
        <meshStandardMaterial color="lightgrey" />
        <Text position={[0, 0, 0.06]} fontSize={0.05} color="#000" anchorX="center" anchorY="middle" >          
        left x {p?.x?.toFixed(2)}{'\n'}
        left y {p?.y?.toFixed(2)}{'\n'}
        left z {p?.z?.toFixed(2)}{'\n'}
        </Text>      
      </Box>
    </>
  )
}


// export HUD;

const WebXr = () => {
  const videoRef = useRef()
  const videoTexture = useRef()

  useEffect(() => {
    if (videoRef.current) {
      // Create a VideoTexture from the video element after it has loaded
      videoRef.current.onloadedmetadata = () => {
        videoTexture.current = new VideoTexture(videoRef.current)
        // Force re-render to apply texture
      }
    }
  }, [])

  return (
    <>
      <VRButton />
      <Canvas>
        <XR>
          <Controllers />
          {/*
          <Hands /> */}
                    <ambientLight intensity={0.5} />

          <pointLight position={[5, 5, 5]} />


          
          <mesh>
            <HUD />
            <boxGeometry />
            {/* <meshBasicMaterial color="blue" /> */}
          </mesh>

        </XR>
      </Canvas>
    </>
  )
}

export default WebXr

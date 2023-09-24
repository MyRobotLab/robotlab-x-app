import React, { useRef, useEffect, useContext, useState } from "react"
import { RuntimeContext } from "../framework/RuntimeContext"
import { PoseText } from "./PoseText"
import { useFrame, createPortal, useThree, Canvas } from "react-three-fiber"
import { useXR } from "@react-three/xr"
import { deltaPose, getEvent, getPose } from "../framework/WebXrUtils"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import { Pane, Plane, useFBO, OrthographicCamera, Box, Text, Html } from "@react-three/drei"
import { VideoTexture, UniformsUtils } from "three"
// FIXME - not sure I like absolute paths, this should probably be relative
import { MinimumShader } from "./minimum"

const videoSource = process.env.PUBLIC_URL + "/assets/buck.mp4"

export const HUD = (props) => {
  const videoTexture = useRef()
  const { message, sendMessage, readyState, sendTo } = useContext(RuntimeContext)
  // const { controllerData, setControllersData } = useState({})
  const threshold = 0.01

  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  const [controllerData, setControllerData] = useState({})

  const url =
    "https://pmdvod.nationalgeographic.com/NG_Video/596/311/1370718787631_1542234923394_1370715715931_mp4_video_1024x576_1632000_primary_audio_eng_3.mp4"

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

  function Object(props) {
    return (
      <group>
        {/*}
        <Box {...props} args={[0.4, 0.1, 0.1]}>
          <meshStandardMaterial color="blue" />
        </Box>
        */}
        <PoseText
          poseName="head"
          position={[0, 0.6, -1.8]}
          scale={0.04}
          controllerData={controllerData}
          precision={precision}
        />
        <PoseText
          poseName="left"
          position={[0, 0.4, -1.8]}
          scale={0.04}
          controllerData={controllerData}
          precision={precision}
        />
        <PoseText
          poseName="right"
          position={[0, 0.2, -1.8]}
          scale={0.04}
          controllerData={controllerData}
          precision={precision}
        />
      </group>
    )
  }

  function CameraLinkedObject() {
    const camera = useThree((state) => state.camera)
    return createPortal(<Object position={[0, -2.0, -1]} />, camera)
  }

  const Texture = ({ texture }) => {
    return (
      <mesh>
        <planeBufferGeometry attach="geometry" args={[16, 9]} />
        <shaderMaterial
          attach="material"
          transparent
          args={[
            {
              ...MinimumShader,
              uniforms: UniformsUtils.clone(MinimumShader.uniforms),
            },
          ]}
          uniforms-texture-value={texture}
        />
      </mesh>
    )
  }

  const Video = ({ video }) => {
    if (video && video.current) {
      const front = new VideoTexture(video.current)
      return <Texture texture={front} />
    }
  }

  const videoRef = useRef(null)
  useEffect(() => {    
    videoRef?.current?.play()    
  }, [videoRef])

  return (
    <group>
      {/*}
      <video
        ref={videoRef}
        autoPlay={true}
        muted={true}
        loop={true}
        crossOrigin="anonymous"
        src={url}
        style={{
          position: "absolute",
          top: "-100%",
          left: "-100%",
          width: "640px",
          height: "360px",
        }}
      />*/}

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
      {/* <Video video={videoRef} /> */}
      <CameraLinkedObject />
    </group>
  )
}

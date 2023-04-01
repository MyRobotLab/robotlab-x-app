import React, { useState, useEffect, useContext } from "react"
import TextareaAutosize from "@mui/base/TextareaAutosize"
import { ReadyState } from "react-use-websocket"
import { get } from "lodash"

import { VRButton, XR, Hands, useXR, Interactive, useHitTest, useController, Controllers } from "@react-three/xr"
import { Sky, Text } from "@react-three/drei"
import { useFrame, Canvas } from "@react-three/fiber"

import { FrameRate } from "../components/webxr/FrameRate"

import { RuntimeContext } from "../framework/RuntimeContext"

// FIXME - make this a "service" page

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  )
}

function Box({ color, size, scale, children, ...rest }) {
  return (
    <mesh scale={scale} {...rest}>
      <boxGeometry args={size} />
      <meshPhongMaterial color={color} />
      {children}
    </mesh>
  )
}

function Button(props) {
  const [hover, setHover] = useState(false)
  const [color, setColor] = useState(0x123456)

  const onSelect = () => {
    setColor((Math.random() * 0xffffff) | 0)
  }

  return (
    <Interactive onSelect={onSelect} onHover={() => setHover(true)} onBlur={() => setHover(false)}>
      <Box color={color} scale={hover ? [1.5, 1.5, 1.5] : [1, 1, 1]} size={[0.4, 0.1, 0.1]} {...props}>
        <Text position={[0, 0, 0.06]} fontSize={1.05} color="#000" anchorX="center" anchorY="middle">
          fps
        </Text>
      </Box>
    </Interactive>
  )
}

// function HUD() {
//   // const { gl, camera } = useThree();

//   if (!useXR().getController('left') || !useXR().getController('right')){
//     return(<></>)
//   }

//   const { x: hX, y: hY, z: hZ } = useXR().getController('left').controller.position;
//   const { x: rX, y: rY, z: rZ } = useXR().getController('right').controller.position;
//   const { x: hRX, y: hRY, z: hRZ } = useXR().getController('left').controller.rotation;
//   const { x: rRX, y: rRY, z: rRZ } = useXR().getController('right').controller.rotation;

//   return (
//     <div style={{ position: 'absolute', top: 0, left: 0 }}>
//       <p>Headset Position: {hX.toFixed(2)}, {hY.toFixed(2)}, {hZ.toFixed(2)}</p>
//       <p>Headset Rotation: {hRX.toFixed(2)}, {hRY.toFixed(2)}, {hRZ.toFixed(2)}</p>
//       <p>Right Controller Position: {rX.toFixed(2)}, {rY.toFixed(2)}, {rZ.toFixed(2)}</p>
//       <p>Right Controller Rotation: {rRX.toFixed(2)}, {rRY.toFixed(2)}, {rRZ.toFixed(2)}</p>
//     </div>
//   );
// }

const mappings = {
   "head":{
      "position":{
         "x":{
            "minIn":-3.14,
            "maxIn":3.14,
            "minOut":0,
            "maxOut":180
         },
         "y":{
            "minIn":-3.14,
            "maxIn":3.14,
            "minOut":0,
            "maxOut":180
         },
         "z":{
            "minIn":-3.14,
            "maxIn":3.14,
            "minOut":0,
            "maxOut":180
         }
      },
      "orientation":{
         "roll":{
            "minIn":-3.14,
            "maxIn":3.14,
            "minOut":0,
            "maxOut":180
         },
         "pitch":{
            "minIn":-3.14,
            "maxIn":3.14,
            "minOut":0,
            "maxOut":180
         },
         "yaw":{
            "minIn":-3.14,
            "maxIn":3.14,
            "minOut":0,
            "maxOut":180
         }
      }
   }
}

function getMappedValue(path, mappings, defaultValue) {
  const map = get(mappings, path)
  if (!map) {
    return defaultValue
  }

  return ((defaultValue - map.minIn) * (map.maxOut - map.minOut)) / (map.maxIn - map.minIn) + map.minIn
}

function getPose(name, position, orientation, mappings) {
  return {
    name: name,
    position: {
     x: position.x, // getMappedValue(name + ".position.x", mappings, position.x),
     y: position.y, // getMappedValue(name + ".position.y", mappings, position.y),
     z: position.z // getMappedValue(name + ".position.z", mappings, position.z),
    },
    orientation: {
      roll: orientation._z, // getMappedValue(name + ".orientation.roll", mappings, orientation._x),
      pitch: orientation._x, // getMappedValue(name + ".orientation.pitch", mappings, orientation._y),
      yaw: orientation._y // getMappedValue(name + ".orientation.yaw", mappings, orientation._z)
    },
  }
}

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

let lastPoses = {}

function ControllerData() {
  const player = useXR((state) => state.player)
  const left = useController("left")
  const right = useController("right")
  const gaze = useController("none")

  const threshold = 0.01

  const { message, sendMessage, readyState, sendTo } = useContext(RuntimeContext)

  // FIXME - diffDeltaPublish publish only on dif > 0.01

  useFrame(() => {
    // beginning of frame - high rps processing
    if (player.children) {
      // console.log(player.children[0].controller.rotation);
    }

    if (left) {
      const p = left.controller.position
      // console.info(`left ${p.x} ${p.y} ${p.z}`)
    }

    if (right) {
      const p = right.controller.position
      // console.info(`right ${p.x} ${p.y} ${p.z}`)
    }

    // headset controller 0
    if (player.children[0]) {
      const p = player.children[0].position
      const r = player.children[0].rotation
      // console.info(`headset ${p.x} ${p.y} ${p.z}`)
      // FIXME - send('method', data)
      let pose = getPose("head", p, r, mappings)

      if (deltaPose(pose, lastPoses[pose.name], threshold)) {
        sendTo("webxr", "publishPose", pose)
      }
      lastPoses[pose.name] = pose

      // sendMessage(player.children[0].position)
    }
  })
  // console.info(player.rotation)

  return null
}

const WebXr = () => {
  const [value, setValue] = useState(0)
  /// const player = useXR((state) => state.player)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const { message, sendMessage, readyState } = useContext(RuntimeContext)
  const [messageInput, setMessageInput] = useState("")

  const handleMessageChange = (event) => {
    setMessageInput(event.target.value)
  }

  const handleSendMessage = () => {
    sendMessage(messageInput)
    setMessageInput("")
  }

  return (
    <>
      <VRButton onError={(e) => console.error(e)} />
      <Canvas>
        <XR>
          <Sky sunPosition={[0, 1, 0]} />
          <Floor />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Controllers />
          <Button position={[0, 0.8, -1]} />
          {true && <ControllerData />}
          <FrameRate />
        </XR>
      </Canvas>
    </>
  )
}

export default WebXr

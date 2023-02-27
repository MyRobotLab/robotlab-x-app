import React, { useState, useEffect, useContext } from "react"
import TextareaAutosize from "@mui/base/TextareaAutosize"
import { ReadyState } from "react-use-websocket"
import { RuntimeContext } from "../framework/RuntimeContext"
import { JSONTree } from "react-json-tree"
import { Interactive, XR, Controllers, VRButton, useController } from "@react-three/xr"
import { Sky, Text } from "@react-three/drei"
import "@react-three/fiber"
// import './styles.css'
import { Canvas } from "@react-three/fiber"

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
    <Interactive
      onSelect={onSelect}
      onHover={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Box
        color={color}
        scale={hover ? [1.5, 1.5, 1.5] : [1, 1, 1]}
        size={[0.4, 0.1, 0.1]}
        {...props}
      >
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.05}
          color="#000"
          anchorX="center"
          anchorY="middle"
        >
          Hello react-xr!
        </Text>
      </Box>
    </Interactive>
  )
}

const WebXr = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const { registry, updateUser } = useContext(RuntimeContext)
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
      <img
        alt="disconnected"
        src={
          readyState === ReadyState.OPEN
            ? `../../assets/green.png`
            : `../../assets/red.png`
        }
      />

      <VRButton />
      <Canvas>
        <XR>
          <Sky sunPosition={[0, 1, 0]} />
          <Floor />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Controllers />
          <Button position={[0, 0.8, -1]} />
        </XR>
      </Canvas>
    </>
  )
}

export default WebXr

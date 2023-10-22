import React, { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react"
import { HUD2 } from "../components/webxr/HUD2"
import { useFrame, createPortal, useThree, Canvas } from "@react-three/fiber"
import { useXR } from "@react-three/xr"
import { deltaPose, getEvent, getPose } from "../framework/WebXrUtils"
import { VRButton, ARButton, XR, Controllers, Hands, useXREvent, useController } from "@react-three/xr"
import {
  Pane,
  Plane,
  useFBO,
  OrthographicCamera,
  Box,
  Text,
  Html,
  Image,
  useTexture,
  useVideoTexture,
} from "@react-three/drei"
import { VideoTexture, UniformsUtils } from "three"
import store from "../store/store"
import * as THREE from "three"
import OpenCV2 from "../components/webxr/service/OpenCV2"
import Scene from "../components/webxr/Scene"
import MJPEGVideoPanel from "../components/MJPEGVideoPanel"
import WebGLImageRenderer from "./WebGLImageRenderer"

import ReactPlayer from "react-player"

function MjpegImage(...props) {
  // // const ref = useRef()
  // let mpegUrl = null
  // useFrame(() => {
  //   // if (ref.current) {
  //   //   ref.current.url = "http://localhost:8080/?action=stream&tsx=" + new Date().getTime()
  //   //   ref.current.material.uniforms.map.needsUpdate = true
  //   // }
  //   mpegUrl = "http://localhost:8080/?action=stream&tsx=" + new Date().getTime()
  //   return
  //   (  <>
  //     <Text           position={[0, -0.7, -1.8]}
  //         scale={2.0}> HALLO !!!!! </Text>
  //   <Image position={[0, 1, -1]} url={mpegUrl} />
  //   </>
  //     )
  // })

  // if (mpegUrl) {
  //   return
  //   (  <>
  //     <Text           position={[0, -0.7, -1.8]}
  //         scale={2.0}> HALLO !!!!! </Text>
  //   <Image position={[0, 1, -1]} url={mpegUrl} />
  //   </>
  //     )
  // } else {
  //   return <></>
  // }

  const texture = useVideoTexture("http://localhost:8080/?action=stream")
  return (
    <>
      <Image position={[0, 1, -1]} texture={texture} />
    </>
  )

  // return <Image position={[0, 1, -1]} ref={ref} url="http://localhost:8080/?action=stream" />
}

function RotatingBox() {
  const mesh = useRef()

  // Use the useFrame hook to create a custom animation loop
  useFrame(() => {
    // Rotate the mesh by a small amount in each frame
    mesh.current.rotation.x += 0.01
    mesh.current.rotation.y += 0.01
  })

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      {/* <meshStandardMaterial color="orange" /> */}
      <meshBasicMaterial attach="material">
        {/* Use the useTexture hook to load an image texture */}
        <texture
          url="/logo.jpg" // Replace with the URL of your image
          attach="map" // Attach the texture to the "map" property of the material
        />
      </meshBasicMaterial>
    </mesh>
  )
}

function Cube({ url }) {
  const texture = useTexture(url)
  return (
    <mesh>
      <meshBasicMaterial map={texture} />
      <boxGeometry />
    </mesh>
  )
}

export default function WebXR() {
  console.info("WebXR start")

  return (
    <>
      {/*
      <ReactPlayer
        url="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm"
        autoPlay
        autoplay={true}
        muted={true}
      />
      
      <video src="/stream.m3u8" autoPlay />

      
      <video src="http://localhost:8080/yourstream" autoPlay />

      <video src="/output.flv" />
      */}

      {/*
       <ReactFlvPlayer
          url = "/output.flv"
          isMuted={true}
        />
        */}

      {/*
      <iframe width="424" height="240" src="https://www.youtube.com/embed/AAKm0jro_hQ" title="test" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      */}
      {/* <iframe width="424" height="240" src="https://www.youtube.com/embed/AAKm0jro_hQ" title="test" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe> */}

      <WebGLImageRenderer imageUrl="http://localhost:8080/?action=stream" />

      <VRButton />
      <Canvas>
        <ambientLight intensity={0.5} /> {/* Adjust the ambient light intensity */}
        <pointLight position={[5, 5, 5]} intensity={0.8} /> {/* Adjust the point light position and intensity */}
        {/*}
        <Cube url="http://localhost:8080/?action=stream" />
        
        <Box position={[-1, 2, 0]} scale={[1, 1, 1]}>
          <meshBasicMaterial attach="material">
            <texture
              url="/logo.jpg" // Replace with the correct image path
              attach="map"
              onLoad={(texture) => {
                console.log("Texture loaded:", texture)
              }}
            />
          </meshBasicMaterial>
        </Box>
        */}
        <XR>
          {/* <MJPEGVideoPanel mjpegUrl={mjpegUrl} /> */}
          <Controllers />
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <HUD2 />
          <Scene />
          {/*}
          <MjpegImage />

          
          

          
          {/* <RoatatingBox /> 

          <Box position={[-1, 0, 0]} scale={[1, 1, 1]}>
            <meshBasicMaterial attach="material">
              <texture url="/i01.opencv-03386.png" attach="map" />
            </meshBasicMaterial>
          </Box>
          
          <OpenCV2 name="i01.opencv@blah" />
      */}
        </XR>
      </Canvas>
    </>
  )
}

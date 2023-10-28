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

// there should be a s

import ReactPlayer from "react-player"

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
          {/*}
          <Scene />
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

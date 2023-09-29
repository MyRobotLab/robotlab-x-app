import React, { useRef } from "react"
import { useFrame } from "react-three-fiber"
import { TextureLoader } from "three"
import * as THREE from "three"

const VideoPlane = ({ videoFile, position }) => {
  const videoRef = useRef()
  const texture = useRef()

  useFrame(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      texture.current.needsUpdate = true
    }
  })

  return (
    <mesh position={position}>
      <planeGeometry args={[5, 3]} />
      <meshBasicMaterial>
        <videoTexture attach="map" args={[videoRef.current]} ref={texture} />
      </meshBasicMaterial>
      <video
        ref={videoRef}
        src={videoFile}
        autoPlay
        loop
        playsInline
        muted
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
    </mesh>
  )
}

export default VideoPlane

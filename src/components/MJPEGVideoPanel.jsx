import React, { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"

// Define a component that displays the MJPEG stream
export default function MJPEGVideoPanel({ mjpegUrl }) {
  const imgRef = useRef()

  // Function to update the MJPEG image
  const updateMJPEG = () => {
    imgRef.current.src = mjpegUrl
  }

  // Use useFrame to continually update the MJPEG image
  useFrame(() => {
    updateMJPEG()
  })

  return (
    <mesh position={[0, 0, -5]}>
      {/* Use a plane geometry */}
      <planeGeometry args={[5, 3]} />
      <meshBasicMaterial>
        {/* Use the MJPEG stream as the texture */}
        <img ref={imgRef} src={mjpegUrl} alt="MJPEG Stream" crossOrigin="anonymous" />
      </meshBasicMaterial>
    </mesh>
  )
}

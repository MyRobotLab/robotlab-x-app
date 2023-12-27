import * as React from "react"
import Box from "@mui/material/Box"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"

// Props should put in "name"
// and all service types defined here
// the consumer of this and other "views" of components need to be responsible
// to make a layout that has the appropriat "typed" component and injected prop name

export default function Servo(props) {
  console.info("Servo", props)
  return (
    <>
      {props.name}
      <Slider size="small" defaultValue={70} aria-label="Small" valueLabelDisplay="auto" />
      <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
    </>
  )
}

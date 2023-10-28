import * as React from "react"
import Box from "@mui/material/Box"
import Slider from "@mui/material/Slider"

// Props should put in "name"
// and all service types defined here
// the consumer of this and other "views" of components need to be responsible
// to make a layout that has the appropriat "typed" component and injected prop name

export default function SliderSizes() {
  return (
    <Box width={300}>
      <Slider size="small" defaultValue={70} aria-label="Small" valueLabelDisplay="auto" />
      <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
    </Box>
  )
}

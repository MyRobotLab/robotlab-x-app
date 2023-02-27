import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Servo from "../service/Servo"
import { Box, Typography, useTheme } from "@mui/material"
import { tokens } from "../theme"

// interface TabPanelProps {
//   children?: React.ReactNode
//   index: number
//   value: number
// }

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {/* <Typography>{children}</Typography> <- renders <p>*/}
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export default function ServiceTabs() {
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const theme = useTheme()
  const colors = tokens(theme.palette.mode)


  
  return (
    <Box 
    sx={{
      "& .MuiButtonBase-root": {
        border: "none",
        borderBottom: "none",
        color: colors.greenAccent[300],
        backgroundColor: colors.blueAccent[700],
      }
    }}

    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="runtime" {...a11yProps(0)} />
          <Tab label="servo" {...a11yProps(1)} />
          <Tab label="arduino" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        Runtime Panel
      </TabPanel>
      <TabPanel value={value} index={1}>
      Servo Panel
      <div><Servo/></div>
      </TabPanel>
      <TabPanel value={value} index={2}>
      Arduino Panel
      </TabPanel>
    </Box>
  )
}

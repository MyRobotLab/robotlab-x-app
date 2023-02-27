import React, { useState, useContext } from "react"
import { Box, Typography, useTheme } from "@mui/material"
import { ReadyState } from 'react-use-websocket'
import { DataGrid } from "@mui/x-data-grid"
import { tokens } from "../theme"
import { mockDataTeam } from "../data/mockData"
import ServiceTabs from "../components/ServiceTabs"
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined"
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined"
import Header from "../components/Header"
import { RuntimeContext } from "../framework/RuntimeContext"
import { JSONTree } from "react-json-tree"

const TabLayout = () => {
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

  function TabPanel(props: TabPanelProps) {
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
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    )
  }

  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  return (
    <>
      <img alt="disconnected" src={readyState === ReadyState.OPEN ? `../../assets/green.png`:`../../assets/red.png`} />

      <ServiceTabs></ServiceTabs>

      <div>
        
          Last Message: <JSONTree data={message} />
        
        <div>
          {/* <input type="text" value={messageInput} onChange={handleMessageChange} /> */}

          <button onClick={handleSendMessage}>Send Message</button>
        </div>
      </div>


    </>
  )
}

export default TabLayout

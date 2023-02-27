import React, { useState, useContext } from "react"
import { Box, Typography, useTheme } from "@mui/material"
import { ReadyState } from 'react-use-websocket'
import { DataGrid } from "@mui/x-data-grid"
import { tokens } from "../theme"
import { mockDataTeam } from "../data/mockData"
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined"
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined"
import Header from "../components/Header"
import { RuntimeContext } from "../framework/RuntimeContext"
import { JSONTree } from "react-json-tree"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import TabPanel from "@mui/lab/TabPanel"

const Graph = () => {
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
      <img alt="disconnected" src={readyState === ReadyState.OPEN ? `../../assets/green.png`:`../../assets/red.png`} />
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

export default Graph

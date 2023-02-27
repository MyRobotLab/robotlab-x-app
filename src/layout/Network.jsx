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

const Network = () => {
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



  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const columns = [
    { field: "id", headerName: "Id" },
    {
      field: "direction",
      headerName: "Direction",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "service",
      headerName: "Service",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "method",
      headerName: "Method",
      flex: 1,
    },
    {
      field: "data",
      headerName: "Data",
      flex: 1,
    }
  ]

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

      <Box m="20px">
        <Header title="Network" subtitle="Current network details" />
        <Box
          m="40px 0 0 0"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
          }}
        >
          <DataGrid checkboxSelection rows={mockDataTeam} columns={columns} />
        </Box>
      </Box>
    </>
  )
}

export default Network

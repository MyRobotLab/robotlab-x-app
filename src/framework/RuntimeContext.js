import React, { createContext, useEffect, useCallback, useContext, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

// create the context
export const  RuntimeContext = createContext({})

// TODO - create js platform id

// create a provider component
export const  RuntimeContextProvider = ({ children }) => {
  const [registry, setRegistry] = useState({})
  // const { lastMessage, readyState, message, setMessage} = useWebSocket('ws://localhost:8888/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client')
  // const [socketUrl, setSocketUrl] = useState('ws://localhost:8888/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client')
  // const [message, setMessage] = useState('')
  const [message, setMessage] = useState('')
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8888/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client')
  const [messageHistory, setMessageHistory] = useState([])
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl)


  const getRegistry = () => {
    return registry
  }

  const register = (service) => {
    if (service && service.name){
        setRegistry(registry[service.name]=service)
    }
  }

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage))
    }
  }, [lastMessage, setMessageHistory])

  const handleClickChangeSocketUrl = useCallback(
    () => setSocketUrl('ws://localhost:8888/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client'),
    []
  )

  const handleClickSendMessage = useCallback(() => sendMessage('Hello'), [])

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]  


  const { lastJsonMessage, sendJsonMessage } = useWebSocket(socketUrl, {
    onMessage: (event) => {
      if (event.data != 'X'){
        const message = JSON.parse(event.data)
        setMessage(message)
      } // else atmosphere specific
    },
  })

  // const sendMessage = (message) => {
  //   sendJsonMessage({ message })
  // }


  // exposed methods
  const value = {
    registry,
    message,
    sendMessage,
    register,
    getRegistry,
    lastMessage,
    readyState
  }
  
  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
}

// export default RuntimeContext
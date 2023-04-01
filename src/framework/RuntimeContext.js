import React, { createContext, useEffect, useCallback, useContext, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
// const { URL } = require('url');

// create the context
export const  RuntimeContext = createContext({})

// TODO - create js platform id

// create a provider component
export const  RuntimeContextProvider = ({ children }) => {
  
  var url = require('url');
  let urlParts = url.parse(window.location.href)
  
  // Extract the scheme, host, and port from the parsed URL
  const scheme = urlParts.protocol.replace(':', '');
  const hostname = urlParts.hostname;
  const port = urlParts.port || (scheme === 'https' ? '443' : '80');
  const wsSchema = (scheme === 'https')? 'wss':'ws'
  // const wsUrl = `${wsSchema}://${host}:${port}/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client`
  // FIXME - certainly cannot be hardcoded
  const wsUrl = `wss://${hostname}:8443/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client`
  
  console.log(wsUrl)
  
  const [registry, setRegistry] = useState({})
  // const { lastMessage, readyState, message, setMessage} = useWebSocket('ws://localhost:8888/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client')
  // const [socketUrl, setSocketUrl] = useState('ws://localhost:8888/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client')
  // const [message, setMessage] = useState('')
  const [message, setMessage] = useState('')
//  const [socketUrl, setSocketUrl] = useState('wss://localhost:8443/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client')
  const [socketUrl, setSocketUrl] = useState(wsUrl)
  const [messageHistory, setMessageHistory] = useState([])
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl)

  const remoteId = "mrl-id"
  const id = "react-app-id"


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

  const handleClickSendMessage = useCallback(() => sendMessage('Hello'), [])

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]  

  // const sendTo = (...arguments) => {
  //   const name = arguments[0]
  //   const method = arguments[1]
  //   var args = Array.prototype.slice.call(arguments, 2)
  //       var msg = createMessage(name, method, args)
  //       msg.sendingMethod = 'sendTo'
  //       sendMessage(msg)
  //   }

  const sendTo = function(name, method, data) {
        var args = Array.prototype.slice.call(arguments, 2)
        var msg = createMessage(name, method, args)
        msg.sendingMethod = 'sendTo'

        // GOOD DEBUGGING
        // console.info('out-msg <-- ' + msg.name + '.' + msg.method)
        msg.encoding = 'json'
        if (msg.data != null && msg.data.length > 0) {
            // reverse encoding - pop off undefined
            // to shrink paramter length
            // js implementation -
            var pos = msg.data.length - 1
            for (let i = pos; i > -1; --i) {
                if (typeof msg.data[i] == 'undefined') {} else {
                    msg.data[i] = JSON.stringify(msg.data[i])
                }
            }
        }

        let json = JSON.stringify(msg)
    
        sendMessage(json)
    }

    const getFullName = (name) => {

      // FIXME - fix correctly
      return name
      

      if (name.includes('@')) {
          return name
      } else {
          // is string - and is short name - check registry first
          if (remoteId != null) {
              // killer chatty - so chatty it kills browsers
              // console.error('name \"' + service + '\" string supplied name did not have remoteId - this will be a problem !')
              return name + '@' + remoteId
          } else {
              return name
          }
      }
}    

  const createMessage = (inName, inMethod, inParams) => {
        // TODO: consider a different way to pass inParams for a no arg method.
        // rather than an array with a single null element.
        const remoteId = "mrl-id"
        const id = "react-app-id"
    
        let rSuffix = (remoteId == null || inName.includes('@')) ? "" : "@" + remoteId

        var msg = {
            msgId: new Date().getTime(),
            name: getFullName(inName),
            method: inMethod,
            sender: "runtime@" + id,
            sendingMethod: null
        }

        if (inParams == null || (inParams.length == 1 && inParams[0] === null)) {

            return msg
        } else {
            msg["data"] = inParams
            return msg
        }
    }

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
    readyState,
    connectionStatus,
    sendTo
  }
  
  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
}

// export default RuntimeContext
import React, { createContext, useEffect, useCallback, useContext, useState } from "react"
import useSubscriptionStore from "../store/subscriptionStore"

// create the context
export const RuntimeContext = createContext({})

// TODO - create js platform id
// create a provider component
export const RuntimeContextProvider = ({ children }) => {
  var url = require("url")
  let urlParts = url.parse(window.location.href)

  // Extract the scheme, host, and port from the parsed URL
  const scheme = urlParts.protocol.replace(":", "")
  const hostname = urlParts.hostname
  const port = urlParts.port || (scheme === "https" ? "443" : "80")
  const wsSchema = scheme === "https" ? "wss" : "ws"
  const wsUrl = `wss://${hostname}:8443/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client`

  console.log(wsUrl)

  const [subscriptions, setSubscriptions] = useState({})
  const [registry, setRegistry] = useState({})
  const [socketUrl, setSocketUrl] = useState(
    `wss://${hostname}:8443/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client`
  )
  const [readyState, setReadyState] = useState(false)
  const { connect, disconnect, connected, sendJsonMessage } = useSubscriptionStore()

  const remoteId = "mrl-id"
  const id = "react-app-id"
  let socket = null

  useEffect(() => {
    if (!connected) {
      connect(wsUrl)
    }
  }, [socketUrl])

  const getRegistry = () => {
    return registry
  }

  const register = (service) => {
    if (service && service.name) {
      setRegistry((registry[service.name] = service))
    }
  }

  // TODO - varargs list of parameters
  // const sendTo = (...arguments) => {
  //   const name = arguments[0]
  //   const method = arguments[1]
  //   var args = Array.prototype.slice.call(arguments, 2)
  //       var msg = createMessage(name, method, args)
  //       msg.sendingMethod = 'sendTo'
  //       sendMessage(msg)
  //   }

  const sendTo = function (name, method, data) {
    var args = Array.prototype.slice.call(arguments, 2)
    var msg = createMessage(name, method, args)
    msg.sendingMethod = "sendTo"

    // GOOD DEBUGGING
    // console.info('out-msg <-- ' + msg.name + '.' + msg.method)
    msg.encoding = "json"
    if (msg.data != null && msg.data.length > 0) {
      // reverse encoding - pop off undefined
      // to shrink paramter length
      // js implementation -
      var pos = msg.data.length - 1
      for (let i = pos; i > -1; --i) {
        if (typeof msg.data[i] == "undefined") {
        } else {
          msg.data[i] = JSON.stringify(msg.data[i])
        }
      }
    }

    let json = JSON.stringify(msg)
    if (connected) {
      sendJsonMessage(json)
    } else {
      console.error("socket not ready for json msg ", json)
    }
  }

  const getFullName = (name) => {
    // FIXME - fix correctly
    return name

    if (name.includes("@")) {
      return name
    } else {
      // is string - and is short name - check registry first
      if (remoteId != null) {
        // killer chatty - so chatty it kills browsers
        // console.error('name \"' + service + '\" string supplied name did not have remoteId - this will be a problem !')
        return name + "@" + remoteId
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

    let rSuffix = remoteId == null || inName.includes("@") ? "" : "@" + remoteId

    var msg = {
      msgId: new Date().getTime(),
      name: getFullName(inName),
      method: inMethod,
      sender: "runtime@" + id,
      sendingMethod: null,
    }

    if (inParams == null || (inParams.length == 1 && inParams[0] === null)) {
      return msg
    } else {
      msg["data"] = inParams
      return msg
    }
  }

  // Function to subscribe a component with a name, method, and callback
  const subscribe = (name, method, callbackFunction) => {
    let key = name + "." + method
    console.info("Before:", callbackFunction)

    // If callbackFunction is not found in the array, add it
    let methods = subscriptions[key] || []

    for (let i = 0; i < methods.length; i++) {
      let fn = methods[i]
      console.log(fn)
      console.log(fn.toString())
      if (fn.toString() === callbackFunction.toString()) {
        console.info("equals !!")
        return
      }

      console.log(methods[i])
      if (methods[i] == callbackFunction) {
        console.info("equals !!")
      }
      if (methods[i] === callbackFunction) {
        console.info("equals !!")
      }
    }
    methods.push(callbackFunction)
    console.info("Adding:", callbackFunction)
    setSubscriptions((prevSubscriptions) => ({
      ...prevSubscriptions,
      [key]: methods,
    }))
  }

  // Function to unsubscribe a component by name
  const unsubscribe = (name) => {
    setSubscriptions((prevSubscriptions) => {
      const updatedSubscriptions = { ...prevSubscriptions }
      delete updatedSubscriptions[name]
      return updatedSubscriptions
    })
  }

  // exposed methods
  const value = {
    readyState,
    registry,
    getRegistry,
    register,
    sendTo,
    subscribe,
    unsubscribe,
  }

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
}

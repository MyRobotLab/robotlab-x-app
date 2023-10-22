// store.js
import { Url } from "url"
import { create } from "zustand"

const store = (set, get) => ({
  /**
   * @type {WebSocket} socket - The websocket connection
   */
  socket: null,
  /**
   * @type {boolean} connected - True if the websocket is connected
   */
  connected: false,
  /**
   * @type {boolean} connecting - True if the websocket is connecting
   */
  connecting: false,
  /**
   * @type {Message} messages - A dictonary of the latest messages received from the server,
   * keyed by the message name and method.
   */
  data: {},
  messages: {},
  connect: (url) => {
    if (!url) {
      var url = require("url") // served by server
      let urlParts = new URL(window.location.href)
      const scheme = urlParts.protocol.replace(":", "")
      const hostname = urlParts.hostname
      const port = urlParts.port || (scheme === "https" ? "443" : "80")
      const wsSchema = scheme === "https" ? "wss" : "ws"
      const wsUrl = `wss://${hostname}:8443/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=webgui-client`
      url = wsUrl
      console.log(wsUrl)
    }

    if (get().connected || get().connecting) {
      console.log("already connected.")
      return
    }

    set({
      connecting: true,
    })
    const socket = new WebSocket(url)

    socket.onopen = () => {
      set({
        socket: socket,
      })
      set({
        connected: true,
      })
      set({
        connecting: false,
      })
    }

    socket.onclose = () => {
      set({
        socket: null,
      })
      set({
        connected: false,
      })
      set({
        connecting: false,
      })
    }

    socket.onerror = (error) => {
      console.error("websocket error:", error)
    }

    socket.onmessage = (event) => {
      let msg = JSON.parse(event.data)

      // DOUBLE DECODE DO WE HAVE TO ? - FIND OUT
      if (msg.data) {
        for (let x = 0; x < msg.data.length; ++x) {
          msg.data[x] = JSON.parse(msg.data[x])
        }
      }

      try {
        let key = msg.name + "." + msg.method
        // console.info("onmessage", key)
        if (key != "i01.opencv@vertx-vertx.onWebDisplay") {
          return
        }
        // store the message
        set((state) => ({
          messages: {
            ...state.messages,
            [key]: msg,
          },
        }))

        let test = get().messages[key]
        // console.info('onmessage end')
      } catch (error) {
        console.error(error)
      }
    }
  },
  getMsg: (name, method) => {
    let key = name + "." + method
    const messages = get().messages

    if (messages.hasOwnProperty(key)) {
      return messages[key]
    } else {
      return null
    }
  },
  sendJsonMessage: (json) => {
    const socket = get().socket
    if (socket) {
      socket.send(json)
    } else {
      console.error("no socket connection.")
    }
  },

  sendMessage: (msg) => {
    // GOOD DEBUGGING
    // console.info('out-msg <-- ' + msg.name + '.' + msg.method)
    msg.encoding = "json"
    if (msg.data) {
      for (let i = 0; i < msg.data.length; i++) {
          msg.data[i] = JSON.stringify(msg.data[i])
      }
    }

    var json = JSON.stringify(msg)
    get().sendJsonMessage(json)
  },

  sendTo: function (name, method) {
    var args = Array.prototype.slice.call(arguments, 2)
    var msg = get().createMessage(name, method, args)
    msg.sendingMethod = "sendTo"
    get().sendMessage(msg)
  },

  getFullName: (name) => {
    // FIXME - fix correctly
    return name
  },

  createMessage: (inName, inMethod, inParams) => {
    // TODO: consider a different way to pass inParams for a no arg method.
    // rather than an array with a single null element.
    const remoteId = "mrl-id"
    const id = "react-app-id"

    var msg = {
      msgId: new Date().getTime(),
      name: get().getFullName(inName),
      method: inMethod,
      sender: "runtime@" + id,
      sendingMethod: null,
    }

    if (inParams || (inParams.length === 1 && inParams[0])) {
      msg["data"] = inParams
    }
    return msg
  },

  disconnect: () => {
    const { socket } = get().socket
    if (socket) {
      socket.close()
    }
  },
})

export const useStore = create(store)

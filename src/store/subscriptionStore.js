// subscriptionStore.js
import { create } from "zustand"

const useSubscriptionStore = create((set, get) => ({
  subscriptions: {},
  socket: null, // WebSocket instance
  connected: false,
  connecting: false,
  connect: (url) => {
    if (get().connected || get().connecting) {
      console.log("already connected.")
      return
    }

    set({ connecting: true })
    const socket = new WebSocket(url)

    socket.onopen = () => {
      set({ socket:socket })
      set({ connected: true })
      set({ connecting: false })
    }

    socket.onclose = () => {
      set({ socket: null })
      set({ connected: false })
      set({ connecting: false })
    }

    socket.onerror = (error) => {
      console.error("websocket error:", error)
    }

    socket.onmessage = (event) => {
      console.info("onmessage", event)
      let msg = JSON.parse(event.data)

      // DOUBLE DECODE DO WE HAVE TO ? - FIND OUT
      if (msg.data) {
          for (let x = 0; x < msg.data.length; ++x) {
              msg.data[x] = JSON.parse(msg.data[x])
          }
      }
      
      const subscriptions = get().subscriptions
      try {
        let key = msg.name + ' ' + msg.method
        key = "exampleMethod"
        subscriptions[key].callbackMethod(msg)
      } catch (error) {
        console.error(error)
      }
      
    }
  },
  sendJsonMessage: (message) => {
    const socket = get().socket
    if (socket) {
      socket.send(message)
    } else {
      console.error("no socket connection.")
    }
  },
  disconnect: () => {
    const { socket } = get().socket
    if (socket) {
      socket.close()
    }
  },
  subscribe: (name, method, callbackMethod) => {
    // Register the subscription
    set((state) => ({
      subscriptions: {
        ...state.subscriptions,
        [name]: { method, callbackMethod },
      },
    }))
  },
  unsubscribe: (name) => {
    // Remove a subscription by its name
    set((state) => {
      const updatedSubscriptions = { ...state.subscriptions }
      delete updatedSubscriptions[name]
      return { subscriptions: updatedSubscriptions }
    })
  },
}))

export default useSubscriptionStore



## network challenges
The app uses both http and ws to communicate with the server.
A VR headset using WebXR requires https and wss.
Being a react app it can proxy some of these connections with setupProxy.js.
Websocket


* Proxying websockets DOES NOT WORK with the setupProxy.js file and a url for websocket is in REACT_APP_MESSAGE_BASE_URL=wss://localhost:8443/api/messages?user=root&pwd=pwd&session_id=2309adf3dlkdk&id=vertx-gui is required
* Proxying http works through setupProxy.js
* The webrtc currently is aiortc
  cd ~/github/aiortc/examples/webcam
  python webcam.py
  there is a cert and key file for ssl if desired

```js
app.use(
    "/offer",
    createProxyMiddleware({
      target: "http://localhost:8080", // webcam.py
      changeOrigin: true,
      // ws: true,
      secure: false,
    })
  )
```
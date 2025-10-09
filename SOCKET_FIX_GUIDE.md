# Socket.IO Namespace Debugging Guide

## ✅ What I Fixed

The npm projects (Control Room and Fact or Trick) were not working because their client-side JavaScript files were trying to connect to the default Socket.IO namespace (`/`) instead of their specific namespaces (`/control-room` and `/fact-or-trick`).

## 🔧 Changes Made

### 1. Control Room Client Files

**Files updated:**

- `npm-control-room/public/display.js`
- `npm-control-room/public/controller.js`

**Changed from:**

```javascript
const socket = io();
```

**Changed to:**

```javascript
// Determine the Socket.IO namespace and path based on current URL
const currentPath = window.location.pathname;
const namespace = currentPath.startsWith("/control-room")
  ? "/control-room"
  : "/";
const socketPath =
  namespace === "/control-room" ? "/control-room/socket.io/" : "/socket.io/";

const socket = io(namespace, {
  path: socketPath,
});
```

### 2. Fact or Trick Client Files

**Files updated:**

- `npm-fact-or-trick/public/host.js`
- `npm-fact-or-trick/public/controller.js`

**Changed from:**

```javascript
const socket = io();
```

**Changed to:**

```javascript
// Determine the Socket.IO namespace and path based on current URL
const currentPath = window.location.pathname;
const namespace = currentPath.startsWith("/fact-or-trick")
  ? "/fact-or-trick"
  : "/";
const socketPath =
  namespace === "/fact-or-trick" ? "/fact-or-trick/socket.io/" : "/socket.io/";

const socket = io(namespace, {
  path: socketPath,
});
```

## 🧪 Testing

### Test Page

A test page has been created at: `http://localhost:3000/test-sockets`

This page allows you to:

1. Test Control Room display connection
2. Test Control Room controller connection
3. Test Fact or Trick host connection
4. Test Fact or Trick player connection

### Manual Testing

**Test Control Room:**

1. Open `http://localhost:3000/control-room` (Display)
2. Open `http://localhost:3000/control-room/controller` (Controller)
3. Check browser console - should see "Connected to server"
4. Try clicking buttons on controller - should work!

**Test Fact or Trick:**

1. Open `http://localhost:3000/fact-or-trick` (Host)
2. Wait for room to initialize and QR code to appear
3. Open `http://localhost:3000/fact-or-trick/controller?room=XXXXXX` (use the room code)
4. Players should connect and game should be playable

## 🔍 How Socket.IO Namespaces Work

### Without Namespaces (Old Way - Won't Work)

```
Client: io()
Server: io.on('connection')
Path: /socket.io/
```

This only works when the app is on the root path.

### With Namespaces (New Way - Works!)

```
Control Room:
  Client: io('/control-room', { path: '/control-room/socket.io/' })
  Server: io.of('/control-room').on('connection')
  Path: /control-room/socket.io/

Fact or Trick:
  Client: io('/fact-or-trick', { path: '/fact-or-trick/socket.io/' })
  Server: io.of('/fact-or-trick').on('connection')
  Path: /fact-or-trick/socket.io/
```

## 📊 Server Console Output

When connections work, you should see:

```
[Control Room] Client connected: SOCKET_ID
[Control Room] Display registered: SOCKET_ID
[Control Room] Total displays: 1
```

Or:

```
[Fact or Trick] Client connected: SOCKET_ID
[Fact or Trick] Host initialized with room ABC123
```

## 🐛 Troubleshooting

### Issue: "ERR_CONNECTION_REFUSED"

**Solution:** Make sure the server is running (`npm start`)

### Issue: No console logs, socket not connecting

**Solution:** Check browser console for errors. Make sure you're accessing via the correct path (e.g., `/control-room` not `/control-room/`)

### Issue: "404 Not Found" on socket.io.js

**Solution:** The Socket.IO path configuration is wrong. Make sure both client and server use the same path.

### Issue: Socket connects but events don't work

**Solution:** Check that you're emitting to the correct namespace on the server side.

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Can access `http://localhost:3000/`
- [ ] Can access `http://localhost:3000/control-room`
- [ ] Can access `http://localhost:3000/fact-or-trick`
- [ ] Browser console shows "Connected to server" for Control Room
- [ ] Browser console shows connection for Fact or Trick
- [ ] Control Room controller can send commands
- [ ] Fact or Trick can initialize game and show QR code
- [ ] Test page shows successful connections

## 📝 Key Points

1. **Each npm project has its own namespace** - they don't interfere with each other
2. **Static pages don't need Socket.IO** - they just serve HTML/CSS/JS files
3. **The path parameter is critical** - it tells Socket.IO where to find the WebSocket endpoint
4. **Client and server must match** - both must use the same namespace and path

## 🚀 Current Working URLs

- Landing: `http://localhost:3000/`
- Test Page: `http://localhost:3000/test-sockets`
- Control Room Display: `http://localhost:3000/control-room`
- Control Room Controller: `http://localhost:3000/control-room/controller`
- Fact or Trick Host: `http://localhost:3000/fact-or-trick`
- Fact or Trick Controller: `http://localhost:3000/fact-or-trick/controller?room=XXXXX`
- First Day: `http://localhost:3000/first-day`
- Phishing: `http://localhost:3000/phishing`
- Wheel: `http://localhost:3000/wheel`

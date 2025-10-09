require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const QRCode = require("qrcode");
const path = require("path");

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve video files from the 'video' folder
app.use("/video", express.static(path.join(__dirname, "video")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "display.html"));
});

app.get("/controller", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "controller.html"));
});

// QR Code API endpoint - generates QR code as PNG image
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      color: {
        dark: "#1c2346",
        light: "#ffffff",
      },
      type: "png",
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error("QR code generation error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Socket.IO initialization function
function initSocket(httpServer, namespace = "/control-room") {
  const io = new Server(httpServer, {
    path: `${namespace}/socket.io/`,
  });

  const controlRoomIO = io.of(namespace);

  // Track connected displays and controllers
  let connectedDisplays = new Set();
  let connectedControllers = new Set();

  // Socket.IO connection handling
  controlRoomIO.on("connection", (socket) => {
    console.log(`[Control Room] Client connected: ${socket.id}`);

    // Display (main screen) connects
    socket.on("display:register", () => {
      connectedDisplays.add(socket.id);
      socket.join("displays");
      socket.emit("display:registered", { displayId: socket.id });
      console.log(`[Control Room] Display registered: ${socket.id}`);
      console.log(`[Control Room] Total displays: ${connectedDisplays.size}`);
    });

    // Controller (mobile) connects
    socket.on("controller:register", () => {
      connectedControllers.add(socket.id);
      socket.join("controllers");
      socket.emit("controller:registered", {
        controllerId: socket.id,
        displayCount: connectedDisplays.size,
      });
      console.log(`[Control Room] Controller registered: ${socket.id}`);
      console.log(
        `[Control Room] Total controllers: ${connectedControllers.size}`
      );
    });

    // Controller sends a command
    socket.on("control:command", (command) => {
      console.log(
        `[Control Room] Command received from ${socket.id}: ${command.action}`
      );

      // Broadcast command to all displays
      controlRoomIO.to("displays").emit("control:execute", command);

      // Send confirmation back to controller
      socket.emit("control:confirmed", {
        action: command.action,
        timestamp: Date.now(),
      });
    });

    // Display sends feedback/status
    socket.on("display:status", (status) => {
      console.log(`[Control Room] Display status from ${socket.id}:`, status);

      // Broadcast status to all controllers
      controlRoomIO.to("controllers").emit("display:feedback", status);
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (connectedDisplays.has(socket.id)) {
        connectedDisplays.delete(socket.id);
        console.log(`[Control Room] Display disconnected: ${socket.id}`);
        console.log(
          `[Control Room] Remaining displays: ${connectedDisplays.size}`
        );
      }
      if (connectedControllers.has(socket.id)) {
        connectedControllers.delete(socket.id);
        console.log(`[Control Room] Controller disconnected: ${socket.id}`);
        console.log(
          `[Control Room] Remaining controllers: ${connectedControllers.size}`
        );
      }
    });
  });

  console.log(
    `✅ Control Room Socket.IO initialized on namespace: ${namespace}`
  );
}

module.exports = { app, initSocket };

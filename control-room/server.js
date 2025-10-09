require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const QRCode = require("qrcode");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

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

// Track connected displays and controllers
let connectedDisplays = new Set();
let connectedControllers = new Set();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Display (main screen) connects
  socket.on("display:register", () => {
    connectedDisplays.add(socket.id);
    socket.join("displays");
    socket.emit("display:registered", { displayId: socket.id });
    console.log(`Display registered: ${socket.id}`);
    console.log(`Total displays: ${connectedDisplays.size}`);
  });

  // Controller (mobile) connects
  socket.on("controller:register", () => {
    connectedControllers.add(socket.id);
    socket.join("controllers");
    socket.emit("controller:registered", {
      controllerId: socket.id,
      displayCount: connectedDisplays.size,
    });
    console.log(`Controller registered: ${socket.id}`);
    console.log(`Total controllers: ${connectedControllers.size}`);
  });

  // Controller sends a command
  socket.on("control:command", (command) => {
    console.log(`Command received from ${socket.id}: ${command.action}`);

    // Broadcast command to all displays
    io.to("displays").emit("control:execute", command);

    // Send confirmation back to controller
    socket.emit("control:confirmed", {
      action: command.action,
      timestamp: Date.now(),
    });
  });

  // Display sends feedback/status
  socket.on("display:status", (status) => {
    console.log(`Display status from ${socket.id}:`, status);

    // Broadcast status to all controllers
    io.to("controllers").emit("display:feedback", status);
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (connectedDisplays.has(socket.id)) {
      connectedDisplays.delete(socket.id);
      console.log(`Display disconnected: ${socket.id}`);
      console.log(`Remaining displays: ${connectedDisplays.size}`);
    }
    if (connectedControllers.has(socket.id)) {
      connectedControllers.delete(socket.id);
      console.log(`Controller disconnected: ${socket.id}`);
      console.log(`Remaining controllers: ${connectedControllers.size}`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.BIND_HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`\n🎮 Control Room Server running on port ${PORT}`);
  console.log(`🌐 Server listening on ${HOST}:${PORT}`);

  if (process.env.PUBLIC_URL) {
    console.log(`🔗 Public URL: ${process.env.PUBLIC_URL}`);
    console.log(`📱 Controller access: ${process.env.PUBLIC_URL}/controller`);
    console.log(`🖥️  Display access: ${process.env.PUBLIC_URL}/`);
  } else {
    console.log(`🌐 Local access:`);
    console.log(`   Display: http://localhost:${PORT}/`);
    console.log(`   Controller: http://localhost:${PORT}/controller`);
  }

  console.log(`\n✅ Ready to accept connections!`);
  console.log(`📡 Waiting for displays and controllers to connect...\n`);
});

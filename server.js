require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const path = require("path");

const app = express();
const httpServer = createServer(app);

// Serve static NUPCO pages
app.use("/first-day", express.static(path.join(__dirname, "nupco-first-day")));
app.use(
  "/phishing",
  express.static(path.join(__dirname, "nupco-phising-main"))
);
app.use("/wheel", express.static(path.join(__dirname, "nupco-wheel-main")));
app.use("/shared", express.static(path.join(__dirname, "shared")));
app.use("/launcher", express.static(path.join(__dirname, "public/launcher")));

// Import and mount npm projects
const controlRoomApp = require("./npm-control-room/server-module");
const factOrTrickApp = require("./npm-fact-or-trick/server-module");

// Mount npm projects on their own paths
app.use("/control-room", controlRoomApp.app);
app.use("/fact-or-trick", factOrTrickApp.app);

// Pass the http server to socket.io handlers
controlRoomApp.initSocket(httpServer, "/control-room");
factOrTrickApp.initSocket(httpServer, "/fact-or-trick");

// Test page for Socket.IO connections (development only)
app.get("/test-sockets", (req, res) => {
  res.sendFile(path.join(__dirname, "test-sockets.html"));
});

// Root route - redirect to launcher
app.get("/", (req, res) => {
  res.redirect("/launcher");
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.BIND_HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`\n🚀 NUPCO Interactive Hub running on port ${PORT}`);
  console.log(`🌐 Server listening on ${HOST}:${PORT}`);
  console.log(`\n📱 Available pages:`);
  console.log(`   🎮 Launcher (Root): http://localhost:${PORT}/`);
  console.log(`   First Day: http://localhost:${PORT}/first-day`);
  console.log(`   Phishing: http://localhost:${PORT}/phishing`);
  console.log(`   Wheel: http://localhost:${PORT}/wheel`);
  console.log(`   Control Room: http://localhost:${PORT}/control-room`);
  console.log(`   Fact or Trick: http://localhost:${PORT}/fact-or-trick`);
  console.log(`\n✅ All services ready!\n`);
});

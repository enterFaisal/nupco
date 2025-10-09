// Display client-side JavaScript
// Receives commands from controllers and executes them

const socket = io();

// UI Elements
const connectionStatus = document.getElementById("connectionStatus");
const statusText = document.getElementById("statusText");
const standbyScreen = document.getElementById("standbyScreen");
const videoPlayer = document.getElementById("videoPlayer");
const videoSource = document.getElementById("videoSource");
const alarmSound = document.getElementById("alarmSound");
const qrSection = document.getElementById("qrSection");
const qrCode = document.getElementById("qrCode");

let isConnected = false;

// Video paths - THESE SHOULD BE UPDATED WITH ACTUAL VIDEO PATHS
const VIDEO_PATHS = {
  "play-video-1": "video/part1.mp4", // Update with actual path
  "play-video-2": "video/part2.mp4", // Update with actual path
};

// Initialize display
function init() {
  console.log("Display initializing...");

  // Register as display
  socket.emit("display:register");

  // Setup video event listeners
  setupVideoListeners();

  // Generate QR code for controller access
  generateQRCode();
}

// Setup video event listeners
function setupVideoListeners() {
  videoPlayer.addEventListener("ended", () => {
    console.log("Video ended");
    showStandby();
    sendStatus("video-ended");
  });

  videoPlayer.addEventListener("error", (e) => {
    console.error("Video error:", e);
    showStandby();
    sendStatus("video-error");
  });

  videoPlayer.addEventListener("play", () => {
    console.log("Video started playing");
    sendStatus("video-playing");
  });

  videoPlayer.addEventListener("pause", () => {
    console.log("Video paused");
    sendStatus("video-paused");
  });
}

// Generate QR code for controller access
async function generateQRCode() {
  try {
    // Get controller URL
    const protocol = window.location.protocol;
    const host = window.location.host;
    const controllerUrl = `${protocol}//${host}/controller`;

    // Request QR code from server
    const qrImageUrl = `/api/qrcode?url=${encodeURIComponent(controllerUrl)}`;
    qrCode.src = qrImageUrl;

    console.log("QR code generated for:", controllerUrl);
  } catch (error) {
    console.error("QR code generation error:", error);
  }
}

// Execute command from controller
function executeCommand(command) {
  console.log("Executing command:", command.action);

  switch (command.action) {
    case "play-video-1":
      playVideo(VIDEO_PATHS["play-video-1"]);
      break;

    case "play-video-2":
      playVideo(VIDEO_PATHS["play-video-2"]);
      break;

    case "stop-video":
      stopVideo();
      break;

    case "play-alarm":
      playAlarm();
      break;

    default:
      console.warn("Unknown command:", command.action);
  }
}

// Play video
function playVideo(videoPath) {
  console.log("Playing video:", videoPath);

  // Stop any currently playing audio
  if (!alarmSound.paused) {
    alarmSound.pause();
    alarmSound.currentTime = 0;
  }

  // Update video source
  videoSource.src = videoPath;
  videoPlayer.load();

  // Hide standby, show video
  hideStandby();
  videoPlayer.classList.add("active");

  // Play video
  videoPlayer.play().catch((error) => {
    console.error("Error playing video:", error);
    showStandby();
    sendStatus("play-error");
  });

  sendStatus("video-started");
}

// Stop video
function stopVideo() {
  console.log("Stopping video");

  videoPlayer.pause();
  videoPlayer.currentTime = 0;
  videoPlayer.classList.remove("active");

  showStandby();
  sendStatus("video-stopped");
}

// Play alarm sound
function playAlarm() {
  console.log("Playing alarm sound");

  // Stop video if playing
  if (!videoPlayer.paused) {
    videoPlayer.pause();
    videoPlayer.classList.remove("active");
  }

  // Play alarm on loop
  alarmSound.currentTime = 0;
  alarmSound.play().catch((error) => {
    console.error("Error playing alarm:", error);
    sendStatus("alarm-error");
  });

  // Show standby with alarm indicator
  showStandby();
  sendStatus("alarm-playing");

  // Auto-stop alarm after 10 seconds (optional)
  setTimeout(() => {
    if (!alarmSound.paused) {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      sendStatus("alarm-stopped");
    }
  }, 10000);
}

// Show standby screen
function showStandby() {
  standbyScreen.classList.remove("hidden");
  qrSection.classList.remove("hidden");
}

// Hide standby screen
function hideStandby() {
  standbyScreen.classList.add("hidden");
  qrSection.classList.add("hidden");
}

// Send status update to server
function sendStatus(status) {
  socket.emit("display:status", {
    status: status,
    timestamp: Date.now(),
  });
}

// Update connection status UI
function updateConnectionStatus(connected) {
  isConnected = connected;

  if (connected) {
    connectionStatus.classList.add("connected");
    statusText.textContent = "متصل";
  } else {
    connectionStatus.classList.remove("connected");
    statusText.textContent = "غير متصل";
  }
}

// Socket event handlers
socket.on("connect", () => {
  console.log("Connected to server");
  updateConnectionStatus(true);
  init();
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  updateConnectionStatus(false);
});

socket.on("display:registered", (data) => {
  console.log("Display registered:", data);
  updateConnectionStatus(true);
});

socket.on("control:execute", (command) => {
  console.log("Received command:", command);
  executeCommand(command);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  updateConnectionStatus(false);
});

// Enable autoplay and fullscreen on first user interaction
let userInteracted = false;

function enableAutoplay() {
  if (!userInteracted) {
    userInteracted = true;
    console.log("User interaction detected - autoplay enabled");
    
    // Try to play and immediately pause to unlock autoplay
    videoPlayer.play().then(() => {
      videoPlayer.pause();
    }).catch(() => {
      console.log("Autoplay unlock attempt");
    });
    
    alarmSound.play().then(() => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
    }).catch(() => {
      console.log("Audio unlock attempt");
    });
  }
  
  // Request fullscreen
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.log("Fullscreen request failed:", err);
    });
  }
}

// Listen for any user interaction
document.addEventListener("click", enableAutoplay, { once: true });
document.addEventListener("keydown", enableAutoplay, { once: true });
document.addEventListener("touchstart", enableAutoplay, { once: true });

// Prevent screen from sleeping
if ("wakeLock" in navigator) {
  let wakeLock = null;

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake lock activated");
    } catch (err) {
      console.error("Wake lock error:", err);
    }
  };

  requestWakeLock();

  document.addEventListener("visibilitychange", () => {
    if (wakeLock !== null && document.visibilityState === "visible") {
      requestWakeLock();
    }
  });
}

// Handle keyboard shortcuts (for testing/debugging)
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "1":
      executeCommand({ action: "play-video-1" });
      break;
    case "2":
      executeCommand({ action: "play-video-2" });
      break;
    case "s":
    case "S":
      executeCommand({ action: "stop-video" });
      break;
    case "a":
    case "A":
      executeCommand({ action: "play-alarm" });
      break;
    case "Escape":
      stopVideo();
      if (!alarmSound.paused) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
      }
      break;
  }
});

console.log(
  "Display ready. Keyboard shortcuts: 1 (video 1), 2 (video 2), S (stop), A (alarm), ESC (stop all)"
);

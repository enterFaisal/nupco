// Controller client-side JavaScript
// Handles button clicks and sends commands to displays via WebSocket

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

// UI Elements
const statusBar = document.getElementById("statusBar");
const statusText = document.getElementById("statusText");
const playVideo1Btn = document.getElementById("playVideo1Btn");
const playVideo2Btn = document.getElementById("playVideo2Btn");
const stopVideoBtn = document.getElementById("stopVideoBtn");
const playAlarmBtn = document.getElementById("playAlarmBtn");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");
const feedbackMsg = document.getElementById("feedbackMsg");

let isConnected = false;
let displayCount = 0;

// Initialize controller
function init() {
  console.log("Controller initializing...");

  // Register as controller
  socket.emit("controller:register");

  // Setup button event listeners
  setupButtons();
}

// Setup button event listeners
function setupButtons() {
  playVideo1Btn.addEventListener("click", () => {
    sendCommand("play-video-1");
  });

  playVideo2Btn.addEventListener("click", () => {
    sendCommand("play-video-2");
  });

  stopVideoBtn.addEventListener("click", () => {
    sendCommand("stop-video");
  });

  playAlarmBtn.addEventListener("click", () => {
    sendCommand("play-alarm");
  });

  stopAlarmBtn.addEventListener("click", () => {
    sendCommand("stop-alarm");
  });
}

// Send command to server
function sendCommand(action) {
  if (!isConnected) {
    showFeedback("غير متصل بالخادم!", "error");
    return;
  }

  if (displayCount === 0) {
    showFeedback("لا توجد شاشات متصلة!", "error");
    return;
  }

  console.log(`Sending command: ${action}`);

  socket.emit("control:command", {
    action: action,
    timestamp: Date.now(),
  });

  // Provide immediate visual feedback
  const button = event.currentTarget;
  button.style.transform = "scale(0.95)";
  setTimeout(() => {
    button.style.transform = "";
  }, 100);
}

// Show feedback message
function showFeedback(message, type = "success") {
  feedbackMsg.textContent = message;
  feedbackMsg.className = `feedback show ${type}`;

  setTimeout(() => {
    feedbackMsg.classList.remove("show");
  }, 3000);
}

// Update connection status UI
function updateConnectionStatus(connected, displays = 0) {
  isConnected = connected;
  displayCount = displays;

  if (connected) {
    statusBar.classList.add("connected");
    statusBar.classList.remove("error");
    statusText.textContent = `متصل (${displays} شاشة متصلة)`;
    enableButtons();
  } else {
    statusBar.classList.remove("connected");
    statusBar.classList.add("error");
    statusText.textContent = "غير متصل";
    disableButtons();
  }
}

// Enable all buttons
function enableButtons() {
  playVideo1Btn.disabled = false;
  playVideo2Btn.disabled = false;
  stopVideoBtn.disabled = false;
  playAlarmBtn.disabled = false;
  stopAlarmBtn.disabled = false;
}

// Disable all buttons
function disableButtons() {
  playVideo1Btn.disabled = true;
  playVideo2Btn.disabled = true;
  stopVideoBtn.disabled = true;
  playAlarmBtn.disabled = true;
  stopAlarmBtn.disabled = true;
}

// Socket event handlers
socket.on("connect", () => {
  console.log("Connected to server");
  init();
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  updateConnectionStatus(false);
  showFeedback("انقطع الاتصال بالخادم", "error");
});

socket.on("controller:registered", (data) => {
  console.log("Controller registered:", data);
  updateConnectionStatus(true, data.displayCount);
  showFeedback("تم الاتصال بنجاح!", "success");
});

socket.on("control:confirmed", (data) => {
  console.log("Command confirmed:", data);

  const actionMessages = {
    "play-video-1": "تم تشغيل الفيديو - الجزء الأول",
    "play-video-2": "تم تشغيل الفيديو - الجزء الثاني",
    "stop-video": "تم إيقاف الفيديو",
    "play-alarm": "تم تشغيل صوت الإنذار",
    "stop-alarm": "تم إيقاف صوت الإنذار",
  };

  const message = actionMessages[data.action] || "تم تنفيذ الأمر";
  showFeedback(message, "success");
});

socket.on("display:feedback", (status) => {
  console.log("Display feedback:", status);

  // Update display count if provided
  if (status.displayCount !== undefined) {
    updateConnectionStatus(true, status.displayCount);
  }
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  updateConnectionStatus(false);
  showFeedback("خطأ في الاتصال", "error");
});

// Prevent screen from sleeping on mobile
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

// Add haptic feedback on button press (if supported)
function vibrate() {
  if ("vibrate" in navigator) {
    navigator.vibrate(50);
  }
}

// Add vibration to button clicks
[
  playVideo1Btn,
  playVideo2Btn,
  stopVideoBtn,
  playAlarmBtn,
  stopAlarmBtn,
].forEach((btn) => {
  btn.addEventListener("click", vibrate);
});
